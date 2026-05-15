import httpx

PISTON_URL = "https://emkc.org/api/v2/piston/execute"

# Supported languages
LANG_MAP = {
    "python": {
        "language": "python",
        "version": "3.10.0"
    },

    "javascript": {
        "language": "javascript",
        "version": "18.15.0"
    },

    "java": {
        "language": "java",
        "version": "15.0.2"
    },

    "c++": {
        "language": "c++",
        "version": "10.2.0"
    },

    "typescript": {
        "language": "typescript",
        "version": "5.0.3"
    },
}


async def execute_code(
    source_code: str,
    language: str,
    stdin: str = ""
) -> dict:

    lang_key = language.lower()

    lang_config = LANG_MAP.get(lang_key)

    if not lang_config:

        return {
            "stdout": "",
            "stderr": f"Unsupported language: {language}",
            "status": "error",
            "time": None
        }

    payload = {
        "language": lang_config["language"],
        "version": lang_config["version"],

        "files": [
            {
                "content": source_code
            }
        ],

        "stdin": stdin,

        "args": []
    }

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "RankByte-CodeRunner/1.0"
    }

    try:

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            response = await client.post(
                PISTON_URL,
                json=payload,
                headers=headers
            )

            response.raise_for_status()

            result = response.json()

            run = result.get("run", {})

            compile_info = result.get(
                "compile",
                {}
            )

            # =========================
            # COMPILE ERROR
            # =========================

            if (
                compile_info and
                compile_info.get("stderr")
            ):

                return {
                    "stdout": "",
                    "stderr": compile_info.get(
                        "stderr",
                        ""
                    ),
                    "status": "compile_error",
                    "time": None
                }

            stdout = run.get(
                "stdout",
                ""
            ).strip()

            stderr = run.get(
                "stderr",
                ""
            ).strip()

            exit_code = run.get(
                "code",
                0
            )

            return {
                "stdout": stdout,

                "stderr": stderr,

                "status": (
                    "success"
                    if exit_code == 0
                    else "runtime_error"
                ),

                "time": run.get(
                    "cpu_time"
                ),

                "exit_code": exit_code
            }

    except httpx.TimeoutException:

        return {
            "stdout": "",
            "stderr": "Code execution timed out",
            "status": "timeout",
            "time": None
        }

    except httpx.HTTPStatusError as e:

        return {
            "stdout": "",
            "stderr": (
                f"Piston API error: "
                f"{e.response.status_code}"
            ),
            "status": "error",
            "time": None
        }

    except Exception as e:

        return {
            "stdout": "",
            "stderr": str(e),
            "status": "error",
            "time": None
        }