from groq import Groq
from config import settings
import json
import re

client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = "llama-3.1-8b-instant"

def clean_json_response(text: str) -> dict:
    """Extract only the first valid JSON object."""

    text = text.strip()

    # Remove markdown wrappers
    text = re.sub(r"```json\n?", "", text)
    text = re.sub(r"```\n?", "", text)

    # Find first JSON object
    start = text.find("{")

    if start == -1:
        raise ValueError("No JSON object found")

    brace_count = 0
    end = None

    for i in range(start, len(text)):

        if text[i] == "{":
            brace_count += 1

        elif text[i] == "}":
            brace_count -= 1

            if brace_count == 0:
                end = i + 1
                break

    if end is None:
        raise ValueError("Incomplete JSON object")

    json_text = text[start:end]

    try:
        return json.loads(json_text)

    except json.JSONDecodeError as e:

        print("\n===== INVALID JSON RECEIVED =====")
        print(json_text)
        print("=================================\n")

        raise ValueError(
            f"Invalid AI JSON response: {str(e)}"
        )


def generate_coding_task(language: str, user_level: str, user_points: int) -> dict:
    prompt = f"""
You are an expert coding challenge creator.
Generate a coding challenge for a {user_level} developer (total points: {user_points}).
Language: {language}

Difficulty rules:
- Beginner (0-100 pts): Simple problems — loops, conditions, basic functions
- Developer (101-300 pts): Medium — recursion, sorting, string manipulation
- Pro (301-700 pts): Harder — algorithms, data structures
- Expert (701-1500 pts): Complex — advanced algorithms, optimization
- Master (1500+ pts): Expert — system-level, highly optimized

Return ONLY a valid JSON object, no explanation, no markdown:
{{
    "title": "challenge title",
    "description": "clear problem description",
    "example_input": "example input value",
    "example_output": "expected output value",
    "hints": ["hint1", "hint2", "hint3"],
    "difficulty": "Easy or Medium or Hard",
    "test_cases": [
        {{"input": "test1", "expected_output": "out1"}},
        {{"input": "test2", "expected_output": "out2"}}
    ],
    "optimal_solution": "the best solution code with comments",
    "time_complexity": "O(n) - brief explanation",
    "space_complexity": "O(1) - brief explanation"
}}
"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=1200, temperature=0.7
    )
    return clean_json_response(response.choices[0].message.content)


def generate_bug_fix_challenge(
    language: str,
    user_level: str,
    user_points: int
) -> dict:

    prompt = f"""
You are an expert at creating debugging challenges.

Generate a faulty code challenge for a {user_level} developer
(total points: {user_points}).

Language: {language}

Bug count rules:
- Beginner: 1-2 simple bugs
- Developer: 2-3 bugs
- Pro: 3-4 bugs
- Expert/Master: 4-5 bugs

IMPORTANT:
- Return ONLY valid JSON
- Do NOT use markdown
- Do NOT wrap code in triple backticks
- Store code as arrays of lines
- Every code line must be a separate string
IMPORTANT:
- Every described bug MUST actually exist in the faulty code
- Do not invent fake bugs
- The faulty code must fail logically, syntactically, or functionally
- The correct solution must genuinely fix the listed bugs
VERY IMPORTANT:
- Every hint must correspond to a REAL bug
- Do not invent fake bugs
- Do not mention correct code as buggy

Return ONLY this JSON format:

{{
    "title": "bug fix challenge title",

    "description": "what the code is supposed to do",

    "faulty_code_lines": [
        "line 1",
        "line 2",
        "line 3"
    ],

    "bugs_present": [
        "description of bug 1",
        "description of bug 2"
    ],

    "correct_solution_lines": [
        "line 1",
        "line 2",
        "line 3"
    ],

    "difficulty": "Easy or Medium or Hard",

    "hints": [
        "hint about bug area 1",
        "hint about bug area 2"
    ]
}}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],response_format={"type": "json_object"},
        max_tokens=1200,
        temperature=0.7
    )

    return clean_json_response(
        response.choices[0].message.content
    )


def generate_system_design_challenge(user_level: str, user_points: int) -> dict:
    prompt = f"""
You are an expert system design interviewer.
Generate a system design challenge for a {user_level} developer (total points: {user_points}).

Complexity rules:
- Beginner: Simple designs (e.g. Design a Todo App)
- Developer: Medium designs (e.g. Design a URL shortener)
- Pro: Complex designs (e.g. Design a notification system)
- Expert: Advanced designs (e.g. Design Twitter feed algorithm)
- Master: Expert designs (e.g. Design a distributed cache like Redis)

Return ONLY a valid JSON object:
{{
    "title": "system design challenge title",
    "scenario": "detailed scenario description",
    "requirements": ["functional req 1", "functional req 2", "non-functional req 1"],
    "evaluation_criteria": ["criteria 1", "criteria 2"],
    "sample_answer_outline": "brief outline of what a good answer includes",
    "difficulty": "Easy or Medium or Hard",
    "hints": ["architectural hint 1", "scaling hint", "data storage hint"]
}}
"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=1200, temperature=0.7
    )
    return clean_json_response(response.choices[0].message.content)


def get_single_hint(challenge_description: str, language: str, hints_used: int, user_level: str) -> dict:
    prompt = f"""
A {user_level} developer is stuck on this challenge:
{challenge_description}

They have used {hints_used} hint(s) already. Give them hint number {hints_used + 1}.
Make it progressively more specific as the hint number increases.
Do NOT give the full solution. Guide them toward it.

Return ONLY valid JSON:
{{
    "hint": "the hint text here",
    "hint_number": {hints_used + 1},
    "is_final_hint": true or false
}}
"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=300, temperature=0.5
    )
    return clean_json_response(response.choices[0].message.content)


def explain_optimal_solution(challenge_description: str, language: str, user_code: str, optimal_solution: str, user_level: str) -> dict:
    prompt = f"""
A {user_level} developer just attempted this {language} challenge:
{challenge_description}

Their code:
{user_code}

Optimal solution:
{optimal_solution}

Explain the optimal solution step by step. Compare it to their approach. Highlight key learning points.

Return ONLY valid JSON:
{{
    "explanation": "step by step explanation",
    "key_concepts": ["concept 1", "concept 2"],
    "comparison": "how their solution compares to optimal",
    "learning_points": ["learning point 1", "learning point 2"],
    "time_complexity": "O(n) - explanation",
    "space_complexity": "O(1) - explanation"
}}
"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=900, temperature=0.3
    )
    return clean_json_response(response.choices[0].message.content)


def evaluate_code_submission(task_description: str, language: str, user_code: str, user_level: str) -> dict:
    prompt = f"""
Evaluate this {language} code from a {user_level} developer.
Task: {task_description}
Submitted Code:
{user_code}

Return ONLY valid JSON:
{{
    "is_correct": true or false,
    "score": 0 to 100,
    "feedback": "detailed helpful feedback",
    "improvements": ["improvement suggestion 1", "improvement suggestion 2"],
    "time_complexity": "O(n) - explanation",
    "space_complexity": "O(1) - explanation"
}}
"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=800, temperature=0.3
    )
    return clean_json_response(response.choices[0].message.content)


def evaluate_bug_fix(
    original_faulty_code: str,
    bugs_present: list,
    user_fixed_code: str,
    language: str
) -> dict:

    prompt = f"""
You are a STRICT bug-fix evaluator.

Your ONLY job is to verify whether the ORIGINAL known bugs were fixed.

========================
LANGUAGE
========================
{language}

========================
ORIGINAL FAULTY CODE
========================
<<<CODE_START>>>
{original_faulty_code}
<<<CODE_END>>>

========================
KNOWN BUGS
========================
{json.dumps(bugs_present)}

========================
USER FIXED CODE
========================
<<<CODE_START>>>
{user_fixed_code}
<<<CODE_END>>>

========================
VERY IMPORTANT RULES
========================

1. ONLY evaluate the ORIGINAL known bugs.
2. DO NOT invent new bugs.
3. DO NOT suggest improvements.
4. DO NOT reduce score for:
   - coding style
   - formatting
   - optimization
   - robustness
   - optional validation
5. Ignore best-practice suggestions unless they are directly related to the original bugs.
6. If ALL original bugs are fixed:
   - set "is_fixed" = true
   - score MUST be between 95-100
7. If some bugs remain:
   - explain ONLY those remaining bugs
8. If code is broken or invalid:
   - maximum score 20
9. DO NOT act like a senior reviewer.
10. Act like an online coding platform judge.

========================
RETURN RULES
========================

- Return ONLY valid JSON
- No markdown
- No explanations outside JSON
- No triple backticks

========================
RETURN FORMAT
========================

{{
    "is_fixed": true,
    "score": 100,

    "bugs_correctly_fixed": [
        "bug description"
    ],

    "bugs_missed": [
        "remaining bug"
    ],

    "feedback": "short evaluation summary",

    "extra_issues_introduced": []
}}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={"type": "json_object"},
        max_tokens=800,
        temperature=0
    )

    return clean_json_response(
        response.choices[0].message.content
    )
def evaluate_system_design(scenario: str, requirements: list, user_answer: str, user_level: str) -> dict:
    prompt = f"""
Evaluate this system design answer from a {user_level} developer.
Scenario: {scenario}
Requirements: {json.dumps(requirements)}
User's answer: {user_answer}

Return ONLY valid JSON:
{{
    "score": 0 to 100,
    "feedback": "detailed overall feedback",
    "what_was_good": ["good point 1", "good point 2"],
    "what_was_missing": ["missing point 1", "missing point 2"],
    "suggested_improvements": ["improvement 1", "improvement 2"]
}}
"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=800, temperature=0.3
    )
    return clean_json_response(response.choices[0].message.content)