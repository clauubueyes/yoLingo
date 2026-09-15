import shutil
import subprocess
from pathlib import Path

import pytest

NODE = shutil.which("node")
TEST_FILE = Path(__file__).parent / "javascript" / "study-session.test.js"


@pytest.mark.skipif(NODE is None, reason="Node.js is required for frontend behavior tests")
def test_study_session_behavior() -> None:
    result = subprocess.run(
        [NODE, "--test", str(TEST_FILE)],
        capture_output=True,
        check=False,
        text=True,
    )

    assert result.returncode == 0, f"{result.stdout}\n{result.stderr}"
