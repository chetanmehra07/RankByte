from groq import Groq
from config import settings
import json
import re
import time

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
You are a senior software engineer and elite debugging challenge creator.

Generate a REALISTIC and HIGH-QUALITY bug-fix coding challenge
for a {user_level} developer (total points: {user_points}).

Language: {language}

==================================================
PLATFORM CONTEXT
==================================================

This platform is NOT for absolute beginners.

All challenges should feel like:
- real engineering debugging tasks
- interview-quality problems
- production-level failures
- competitive coding scenarios
- backend/frontend/system debugging tasks

NEVER generate:
- trivial calculators
- simple counters
- basic CRUD examples
- beginner loop exercises
- toy arithmetic problems
- overly educational examples

==================================================
DIFFICULTY GUIDELINES
==================================================

- Beginner:
  Entry-level professional debugging involving:
  arrays, strings, functions, edge cases,
  incorrect conditions, and intermediate logic bugs.

- Developer:
  Real-world debugging involving:
  recursion, hashing, sorting, APIs,
  object-oriented code, async flows,
  and performance-related mistakes.

- Pro:
  Complex debugging involving:
  advanced data structures,
  graph/tree traversal,
  dynamic programming,
  caching logic,
  concurrency issues,
  hidden edge cases,
  and optimization bugs.

- Expert:
  Production-grade debugging involving:
  distributed systems,
  race conditions,
  async failures,
  memory optimization,
  scalability bottlenecks,
  deadlocks,
  database consistency,
  and architectural flaws.

- Master:
  Elite system-level debugging involving:
  microservices,
  high-scale distributed systems,
  fault tolerance,
  real-time systems,
  load balancing,
  network failures,
  multithreaded optimization,
  infrastructure-level failures,
  and reliability engineering.

==================================================
IMPORTANT RULES
==================================================

- Difficulty must depend on reasoning complexity,
  NOT number of bugs.

- The bugs should require deep debugging skill,
  not simple syntax corrections.

- Use realistic function names,
  realistic business logic,
  and production-like code.

- Include hidden edge cases where appropriate.

- For higher levels:
  - bugs should not be obvious immediately
  - require deeper reasoning
  - require understanding system behavior
  - require debugging flow analysis

- The challenge should feel like something
  a professional engineer might actually face.

==================================================
RETURN RULES
==================================================

- Return ONLY valid JSON
- No markdown
- No explanations
- No triple backticks
- Keep JSON compact
- Ensure JSON is COMPLETE and CLOSED properly

==================================================
RETURN FORMAT
==================================================

{{
    "title": "bug fix challenge title",

    "description": "what the code is supposed to do",

    "faulty_code_lines": [
        "line 1",
        "line 2"
    ],

    "bugs_present": [
        "bug 1",
        "bug 2"
    ],

    "correct_solution_lines": [
        "line 1",
        "line 2"
    ],

    "difficulty": "Easy/Medium/Hard",

    "hints": [
        "hint 1",
        "hint 2"
    ]
}}
"""

    # ======================================================
    # RETRY LOOP
    # ======================================================

    for attempt in range(3):

        try:

            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                max_tokens=2000,
                temperature=0.5
            )

            return clean_json_response(
                response.choices[0].message.content
            )

        except Exception as e:

            print(f"Retry {attempt + 1} failed:", e)

            time.sleep(1)

    raise ValueError(
        "Failed to generate valid bug-fix challenge JSON"
    )
def generate_system_design_challenge(
    user_level: str,
    user_points: int
) -> dict:

    prompt = f"""
You are a senior staff engineer and elite system design interviewer.

Generate a HIGH-QUALITY and REALISTIC system design challenge
for a {user_level} developer (total points: {user_points}).

==================================================
PLATFORM CONTEXT
==================================================

This platform is NOT for absolute beginners.

All system design challenges should feel like:
- real engineering interview questions
- scalable production systems
- backend architecture problems
- distributed systems design
- infrastructure engineering tasks
- high-scale application design

NEVER generate:
- trivial apps
- toy systems
- basic CRUD designs
- simple todo apps
- basic calculator systems
- unrealistic educational examples

==================================================
DIFFICULTY GUIDELINES
==================================================

- Beginner:
  Entry-level professional system design involving:
  API design,
  authentication,
  caching basics,
  database selection,
  pagination,
  file uploads,
  and moderate scalability.

  Example scope:
  - Design an online code snippet sharing platform
  - Design a collaborative notes app
  - Design a basic analytics dashboard backend

- Developer:
  Real-world scalable systems involving:
  queues,
  notifications,
  websocket systems,
  search systems,
  CDN usage,
  rate limiting,
  retries,
  monitoring,
  and horizontal scaling.

  Example scope:
  - Design a URL shortener at scale
  - Design a live chat system
  - Design a notification delivery service

- Pro:
  Complex distributed systems involving:
  microservices,
  distributed caching,
  event-driven architecture,
  consistency tradeoffs,
  database partitioning,
  async processing,
  and high throughput systems.

  Example scope:
  - Design a scalable e-commerce search engine
  - Design a ride matching system
  - Design a video processing pipeline

- Expert:
  Production-grade large-scale architecture involving:
  fault tolerance,
  distributed coordination,
  real-time systems,
  multi-region deployment,
  replication,
  stream processing,
  large-scale feeds,
  advanced scaling,
  and reliability engineering.

  Example scope:
  - Design Twitter/X timeline generation
  - Design a distributed payment processing system
  - Design a real-time multiplayer game backend
  - Design a distributed metrics ingestion platform

- Master:
  Elite infrastructure-level distributed systems involving:
  globally distributed architecture,
  consensus systems,
  service discovery,
  leader election,
  distributed locking,
  massive-scale caching,
  high availability guarantees,
  infrastructure orchestration,
  and low-latency distributed computing.

  Example scope:
  - Design Redis
  - Design Kubernetes scheduler
  - Design Google Docs realtime sync engine
  - Design a distributed CDN
  - Design Kafka-like event streaming system

==================================================
IMPORTANT RULES
==================================================

- Difficulty should depend on architecture complexity,
  scalability reasoning,
  tradeoff analysis,
  and distributed systems understanding.

- Every challenge MUST require:
  - scalability discussion
  - database reasoning
  - API/service architecture
  - caching considerations
  - reliability thinking

- Higher-level challenges should require:
  - tradeoff analysis
  - bottleneck handling
  - fault tolerance
  - consistency discussion
  - production-level reasoning

- Challenges should feel realistic and modern.

==================================================
RETURN RULES
==================================================

- Return ONLY valid JSON
- No markdown
- No explanations
- No triple backticks
- Ensure JSON is COMPLETE and CLOSED properly

==================================================
RETURN FORMAT
==================================================

{{
    "title": "system design challenge title",

    "scenario": "detailed realistic scenario description",

    "requirements": [
        "functional requirement 1",
        "functional requirement 2",
        "non-functional requirement"
    ],

    "evaluation_criteria": [
        "architecture quality",
        "scalability reasoning",
        "tradeoff analysis"
    ],

    "sample_answer_outline":
        "brief outline of what a strong answer should include",

    "difficulty": "Easy/Medium/Hard",

    "hints": [
        "architecture hint",
        "scaling hint",
        "database hint"
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
        ],
        response_format={"type": "json_object"},
        max_tokens=2000,
        temperature=0.6
    )

    return clean_json_response(
        response.choices[0].message.content
    )


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
def evaluate_system_design(
    scenario: str,
    requirements: list,
    user_answer: str,
    user_level: str
) -> dict:

    # =========================================
    # BASIC VALIDATION BEFORE AI
    # =========================================


    cleaned_answer = user_answer.strip()

    word_count = len(cleaned_answer.split())

    meaningful_words = re.findall(
        r"[a-zA-Z]{3,}",
        cleaned_answer
    )

    unique_words = len(
        set(word.lower() for word in meaningful_words)
    )

    # Reject extremely short answers
    if word_count < 8:

        return {
            "score": 0,
            "feedback": "Answer is too short.",
            "what_was_good": [],
            "what_was_missing": [
                "Architecture explanation",
                "Scalability discussion",
                "System components"
            ],
            "suggested_improvements": [
                "Provide a more detailed system design answer"
            ]
        }

    # Reject gibberish / spam
    if unique_words < 5:

        return {
            "score": 0,
            "feedback": "Answer appears to contain random or meaningless text.",
            "what_was_good": [],
            "what_was_missing": [
                "Meaningful architecture discussion"
            ],
            "suggested_improvements": [
                "Write a real system design explanation"
            ]
        }

    # =========================================
    # STRICT AI EVALUATION
    # =========================================

    prompt = f"""
You are a STRICT system design interviewer.

Your job is to critically evaluate the user's answer.

==================================
SCENARIO
==================================

{scenario}

==================================
REQUIREMENTS
==================================

{json.dumps(requirements)}

==================================
USER ANSWER
==================================

{user_answer}

==================================
VERY IMPORTANT SCORING RULES
==================================

1. If the answer is nonsense, random text,
irrelevant, or extremely vague:
   - score MUST be below 20

2. If the answer is extremely short:
   - score MUST be below 30

3. ONLY give 60+ if:
   - architecture is explained
   - components are identified
   - scalability is discussed
   - databases/cache/apis are mentioned
   - tradeoffs are considered

4. ONLY give 80+ for strong production-level thinking.

5. Be STRICT.

6. Do NOT inflate scores.

==================================
SCORING RUBRIC
==================================

Architecture Design: /20
Scalability: /20
Database Design: /20
System Components & APIs: /20
Tradeoffs & Reliability: /20

==================================
RETURN FORMAT
==================================

Return ONLY valid JSON:

{{
    "score": 0 to 100,

    "feedback": "overall evaluation",

    "what_was_good": [
        "good point"
    ],

    "what_was_missing": [
        "missing item"
    ],

    "suggested_improvements": [
        "improvement"
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
        ],
        response_format={"type": "json_object"},
        max_tokens=900,
        temperature=0
    )

    return clean_json_response(
        response.choices[0].message.content
    )