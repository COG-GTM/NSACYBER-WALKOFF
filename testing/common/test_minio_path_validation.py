from pathlib import Path

from common.minio_helper import validate_path_component, validate_app_path, _contained_destination


def test_valid_path_components():
    assert validate_path_component("basics")
    assert validate_path_component("1.0.0")
    assert validate_path_component("app_name-2")
    assert validate_path_component("requirements.txt")


def test_invalid_path_components():
    assert not validate_path_component("")
    assert not validate_path_component(".")
    assert not validate_path_component("..")
    assert not validate_path_component("a/b")
    assert not validate_path_component("a\\b")
    assert not validate_path_component("a b")
    assert not validate_path_component("a;b")
    assert not validate_path_component(None)


def test_valid_app_paths():
    assert validate_app_path("basics", "1.0.0")
    assert validate_app_path("basics", "1.0.0", "src/app.py")
    assert validate_app_path("basics", "1.0.0", "Dockerfile")
    assert validate_app_path("basics", "1.0.0", "src/nested/dir/file.py")


def test_traversal_file_paths_rejected():
    assert not validate_app_path("basics", "1.0.0", "../../../../etc/cron.d/evil")
    assert not validate_app_path("basics", "1.0.0", "src/../../../etc/passwd")
    assert not validate_app_path("basics", "1.0.0", "/etc/passwd")
    assert not validate_app_path("basics", "1.0.0", "\\etc\\passwd")
    assert not validate_app_path("basics", "1.0.0", "src\\..\\evil")
    assert not validate_app_path("basics", "1.0.0", "src//app.py")
    assert not validate_app_path("basics", "1.0.0", "")
    assert not validate_app_path("basics", "1.0.0", "src/./app.py")


def test_traversal_app_name_and_version_rejected():
    assert not validate_app_path("../evil", "1.0.0")
    assert not validate_app_path("basics", "../1.0.0")
    assert not validate_app_path("basics/../..", "1.0.0")
    assert not validate_app_path("", "1.0.0")
    assert not validate_app_path("basics", "")


def test_contained_destination_allows_safe_paths():
    dest = _contained_destination("rebuilt_apps", "basics/1.0.0/src/app.py")
    assert dest == Path("rebuilt_apps") / "basics/1.0.0/src/app.py"


def test_contained_destination_blocks_traversal():
    assert _contained_destination("rebuilt_apps", "basics/1.0.0/../../../../etc/cron.d/evil") is None
    assert _contained_destination("apps", "basics/1.0.0/../../../../etc/passwd") is None
    assert _contained_destination("rebuilt_apps", "../outside") is None
