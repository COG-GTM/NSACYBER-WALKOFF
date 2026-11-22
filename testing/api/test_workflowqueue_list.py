import json
import uuid

from starlette.testclient import TestClient

import api.server.app as app
from api.server.db.workflow import WorkflowModel
from api.server.db.workflowresults import WorkflowStatus

base_workflowqueue_url = "/walkoff/api/workflowqueue/"
limited_role = "00000000-0000-9766-5f6f-705f726f6c65"


def insert_status(name, workflow_id):
    status = WorkflowStatus(name=name, status="COMPLETED", execution_id=uuid.uuid4(), workflow_id=workflow_id)
    app.mongo.reg_client.walkoff_db.workflowqueue.insert_one(dict(status))


def test_list_filters_by_workflow_read_permission(api: TestClient, auth_header: dict, unauthorized_header: dict):
    with open('testing/util/workflow.json') as fp:
        private_wf = json.load(fp)
    shared_wf = json.loads(json.dumps(private_wf))
    shared_wf["id_"] = str(uuid.uuid4())
    shared_wf["name"] = "shared_workflow"
    shared_wf["permissions"]["role_permissions"].append({"role": limited_role, "permissions": ["read"]})
    for wf in (private_wf, shared_wf):
        app.mongo.reg_client.walkoff_db.workflows.insert_one(dict(WorkflowModel(**wf)))

    insert_status("private", uuid.UUID(private_wf["id_"]))
    insert_status("shared", uuid.UUID(shared_wf["id_"]))
    insert_status("deleted", uuid.uuid4())
    insert_status("private_again", uuid.UUID(private_wf["id_"]))

    p = api.get(base_workflowqueue_url, headers=auth_header)
    assert p.status_code == 200
    assert [s["name"] for s in p.json()] == ["private", "shared", "deleted", "private_again"]

    p = api.get(base_workflowqueue_url, headers=unauthorized_header)
    assert p.status_code == 200
    assert [s["name"] for s in p.json()] == ["shared", "deleted"]

    p = api.get(base_workflowqueue_url, headers=auth_header, params={"page": 2, "num_per_page": 2})
    assert p.status_code == 200
    assert [s["name"] for s in p.json()] == ["deleted", "private_again"]
