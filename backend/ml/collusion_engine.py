"""
FORTIX ML — Graph-Based Collusion Detection Engine

Builds entity relationship graphs using NetworkX to detect suspicious
communication clusters, shared file accesses, and credential overlaps
that may indicate insider collusion rings.
"""
import networkx as nx
from networkx.algorithms.community import louvain_communities
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta


class CollusionEngine:
    """
    Constructs a multi-entity graph and runs community detection
    to identify collusion clusters.
    """

    def __init__(self):
        self.graph: nx.Graph = nx.Graph()

    def build_graph(self, db: Session) -> nx.Graph:
        """
        Build entity relationship graph from database.
        Nodes = users, vendors, servers, databases, cloud buckets.
        Edges = communication, shared access, credential overlap.
        """
        from backend.models.db_models import User, Vendor, Event

        self.graph = nx.Graph()

        # Add user nodes
        users = db.query(User).filter(User.is_active == True).all()
        for u in users:
            self.graph.add_node(
                f"user_{u.id}",
                label=u.name,
                entity_type="Employee",
                department=u.department,
                trust_score=u.trust_score,
            )

        # Add vendor nodes
        vendors = db.query(Vendor).all()
        for v in vendors:
            self.graph.add_node(
                f"vendor_{v.id}",
                label=v.name,
                entity_type="Vendor",
                department="Third-Party",
                trust_score=v.trust_score,
            )

        # Add infrastructure nodes
        infra_nodes = [
            ("server_treasury_db", "Treasury DB Server", "Database"),
            ("server_core_banking", "Core Banking Server", "Database"),
            ("cloud_s3_backup", "AWS S3 Backup Bucket", "Cloud"),
            ("cloud_azure_logs", "Azure Log Analytics", "Cloud"),
        ]
        for node_id, label, etype in infra_nodes:
            self.graph.add_node(
                node_id, label=label, entity_type=etype,
                department="Infrastructure", trust_score=95.0,
            )

        # Build edges from events — users who access the same resources
        cutoff = datetime.now(timezone.utc) - timedelta(days=30)
        events = db.query(Event).filter(Event.timestamp >= cutoff).all()

        # Group events by resource target (inferred from description patterns)
        resource_users: dict[str, set[str]] = {}
        for evt in events:
            if evt.user_id is None:
                continue
            user_node = f"user_{evt.user_id}"
            # Infer resource from event type
            if evt.event_type == "DB_Access":
                resource = "server_treasury_db"
            elif evt.event_type == "Cloud":
                resource = "cloud_s3_backup"
            elif evt.event_type == "File_Access":
                resource = "server_core_banking"
            else:
                continue

            # User → Resource edge
            if self.graph.has_node(user_node) and self.graph.has_node(resource):
                if self.graph.has_edge(user_node, resource):
                    self.graph[user_node][resource]["weight"] += 1
                else:
                    self.graph.add_edge(
                        user_node, resource,
                        relation="access", weight=1,
                    )

            resource_users.setdefault(resource, set()).add(user_node)

        # Users accessing the same resource get an implicit communication edge
        for resource, user_set in resource_users.items():
            user_list = list(user_set)
            for i in range(len(user_list)):
                for j in range(i + 1, len(user_list)):
                    u1, u2 = user_list[i], user_list[j]
                    if not self.graph.has_edge(u1, u2):
                        self.graph.add_edge(
                            u1, u2,
                            relation="shared_resource",
                            weight=1,
                            via=resource,
                        )
                    else:
                        self.graph[u1][u2]["weight"] += 1

        # Vendor → resource edges (vendors with active access)
        for v in vendors:
            vendor_node = f"vendor_{v.id}"
            if v.status in ("Active", "Warning"):
                self.graph.add_edge(
                    vendor_node, "server_treasury_db",
                    relation="api_access", weight=v.access_count or 1,
                )

        return self.graph

    def detect_clusters(self) -> list[dict]:
        """
        Run Louvain community detection and calculate collusion risk
        for each cluster using betweenness centrality.
        """
        if len(self.graph.nodes) == 0:
            return []

        # Louvain community detection
        try:
            communities = louvain_communities(self.graph, seed=42)
        except Exception:
            # Fallback: treat each connected component as a community
            communities = list(nx.connected_components(self.graph))

        # Betweenness centrality for the entire graph
        centrality = nx.betweenness_centrality(self.graph, weight="weight")

        clusters = []
        for idx, community in enumerate(communities):
            members = []
            total_centrality = 0.0
            min_trust = 100.0

            for node_id in community:
                attrs = self.graph.nodes[node_id]
                members.append({
                    "id": node_id,
                    "label": attrs.get("label", node_id),
                    "type": attrs.get("entity_type", "Unknown"),
                    "trust_score": attrs.get("trust_score", 100.0),
                    "centrality": round(centrality.get(node_id, 0), 4),
                })
                total_centrality += centrality.get(node_id, 0)
                min_trust = min(min_trust, attrs.get("trust_score", 100))

            # Collusion probability heuristic:
            # Higher centrality + lower trust + more members = higher risk
            size_factor = min(len(members) / 5, 1.0)
            centrality_factor = min(total_centrality * 5, 1.0)
            trust_factor = max(0, (100 - min_trust)) / 100
            collusion_probability = round(
                (size_factor * 0.3 + centrality_factor * 0.4 + trust_factor * 0.3) * 100,
                1,
            )

            clusters.append({
                "cluster_id": idx,
                "members": members,
                "member_count": len(members),
                "collusion_probability": min(collusion_probability, 99.0),
                "min_trust_score": min_trust,
                "is_suspicious": collusion_probability > 40,
            })

        # Sort by risk
        clusters.sort(key=lambda c: c["collusion_probability"], reverse=True)
        return clusters

    def get_graph_data(self) -> dict:
        """Serialize graph to nodes+edges for the frontend SVG renderer."""
        nodes = []
        for node_id, attrs in self.graph.nodes(data=True):
            nodes.append({
                "id": node_id,
                "label": attrs.get("label", node_id),
                "type": attrs.get("entity_type", "Unknown"),
                "trust_score": attrs.get("trust_score", 100.0),
            })

        edges = []
        for u, v, attrs in self.graph.edges(data=True):
            edges.append({
                "source": u,
                "target": v,
                "relation": attrs.get("relation", "unknown"),
                "weight": attrs.get("weight", 1),
            })

        return {"nodes": nodes, "edges": edges}

    def analyze(self, db: Session) -> dict:
        """Full pipeline: build graph → detect clusters → return results."""
        self.build_graph(db)
        clusters = self.detect_clusters()
        graph_data = self.get_graph_data()

        max_risk = max((c["collusion_probability"] for c in clusters), default=0)

        return {
            "clusters": clusters,
            "graph": graph_data,
            "overall_collusion_risk": max_risk,
            "suspicious_clusters_count": sum(1 for c in clusters if c["is_suspicious"]),
        }


# Singleton instance
collusion_engine = CollusionEngine()
