from dataclasses import dataclass


FLAMES_LABELS = ["Friends", "Love", "Affection", "Marriage", "Enemies", "Siblings"]

RESULT_EXPLANATIONS = {
    "Friends": "A strong friendship vibe. You both connect well as trusted companions.",
    "Love": "Romantic energy is high. This pairing points to emotional attraction and chemistry.",
    "Affection": "Warm care and kindness define this bond. You naturally show concern for each other.",
    "Marriage": "Long-term compatibility is highlighted. The pairing suggests stable commitment potential.",
    "Enemies": "Frequent disagreements or friction may arise. Better communication can improve the dynamic.",
    "Siblings": "A protective, sibling-like bond appears. Comfort and familiarity are the key themes.",
}


@dataclass
class NormalizedNames:
    original_name1: str
    original_name2: str
    cleaned_name1: str
    cleaned_name2: str


def normalize_name(value: str) -> str:
    return "".join(character for character in value.lower() if character.isalpha())


def validate_input_names(name1: str, name2: str) -> NormalizedNames:
    if not isinstance(name1, str) or not isinstance(name2, str):
        raise ValueError("Both names must be strings.")

    original_name1 = name1.strip()
    original_name2 = name2.strip()

    if not original_name1 or not original_name2:
        raise ValueError("Both names are required.")

    if len(original_name1) > 120 or len(original_name2) > 120:
        raise ValueError("Each name must be 120 characters or fewer.")

    cleaned_name1 = normalize_name(original_name1)
    cleaned_name2 = normalize_name(original_name2)

    if not cleaned_name1 or not cleaned_name2:
        raise ValueError("Names should include alphabetic characters.")

    return NormalizedNames(
        original_name1=original_name1,
        original_name2=original_name2,
        cleaned_name1=cleaned_name1,
        cleaned_name2=cleaned_name2,
    )


def remove_common_characters(first_name: str, second_name: str):
    second_characters = {}

    for character in second_name:
        second_characters[character] = second_characters.get(character, 0) + 1

    remaining_first = []
    for character in first_name:
        count = second_characters.get(character, 0)
        if count > 0:
            second_characters[character] = count - 1
        else:
            remaining_first.append(character)

    remaining_second_count = sum(second_characters.values())
    return "".join(remaining_first), remaining_second_count


def build_elimination_steps(remaining_count: int):
    if remaining_count == 0:
        return [
            {
                "step": 1,
                "removed": "N/A",
                "remaining": ["Siblings"],
            }
        ]

    flames = FLAMES_LABELS[:]
    steps = []
    index = 0
    step = 1

    while len(flames) > 1:
        index = (index + remaining_count - 1) % len(flames)
        removed = flames.pop(index)
        steps.append(
            {
                "step": step,
                "removed": removed,
                "remaining": flames[:],
            }
        )
        step += 1

    return steps


def calculate_flames(name1: str, name2: str):
    normalized_names = validate_input_names(name1, name2)

    remaining_first, remaining_second_count = remove_common_characters(
        normalized_names.cleaned_name1,
        normalized_names.cleaned_name2,
    )
    remaining_count = len(remaining_first) + remaining_second_count
    elimination_steps = build_elimination_steps(remaining_count)

    relationship = (
        "Siblings" if remaining_count == 0 else elimination_steps[-1]["remaining"][0]
    )

    return {
        "name1": normalized_names.original_name1,
        "name2": normalized_names.original_name2,
        "cleaned_name1": normalized_names.cleaned_name1,
        "cleaned_name2": normalized_names.cleaned_name2,
        "remaining_count": remaining_count,
        "relationship": relationship,
        "explanation": RESULT_EXPLANATIONS[relationship],
        "elimination_steps": elimination_steps,
    }
