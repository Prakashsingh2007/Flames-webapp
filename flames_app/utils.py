from .services.flames_logic import calculate_flames


def flames_relationship(name1, name2):
    """Backward-compatible wrapper for existing imports."""
    return calculate_flames(name1, name2)