def flames_relationship(name1, name2):
    """
    Calculate the FLAMES relationship between two names.
    
    Args:
        name1 (str): First name
        name2 (str): Second name
    
    Returns:
        str: The relationship result
    """
    # Convert to lowercase and remove spaces
    name1 = name1.lower().replace(" ", "")
    name2 = name2.lower().replace(" ", "")
    
    # Remove common characters
    for char in name1:
        if char in name2:
            name1 = name1.replace(char, "", 1)
            name2 = name2.replace(char, "", 1)
    
    # Count remaining characters
    remaining_count = len(name1) + len(name2)
    
    # FLAMES list
    flames = ["Friends", "Love", "Affection", "Marriage", "Enemies", "Siblings"]
    
    # Eliminate until one remains
    while len(flames) > 1:
        # Find the index to eliminate (0-based, wrap around)
        index = (remaining_count - 1) % len(flames)
        flames.pop(index)
    
    return flames[0]

# Example usage
if __name__ == "__main__":
    result = flames_relationship("Alice", "Bob")
    print(result)  # Should print "Enemies" or whatever the calculation gives