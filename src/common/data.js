var base_task_set = [
  { id:1, status:"new", text:"Task 1", tags:"webix,docs", comments:[{text:"Comment 1"}, {text:"Comment 2"}] },
  { id:2, status:"work", text:"Task 2", color:"#FE0E0E", tags:"webix", votes:1, personId: 4  },
  { id:3, status:"work", text:"Task 3", tags:"webix,docs", comments:[{text:"Comment 1"}], personId: 6 },
  { id:4, status:"test", text:"Task 4 pending", tags:"webix 2.5", votes:1, personId: 5  },
  { id:5, status:"new", text:"Task 5", tags:"webix,docs", votes:3  },
  { id:6, status:"new", text:"Task 6", tags:"webix,kanban", comments:[{text:"Comment 1"}, {text:"Comment 2"}], personId: 2 },
  { id:7, status:"work", text:"Task 7", tags:"webix", votes:2, personId: 7, image: "image001.jpg"  },
  { id:8, status:"work", text:"Task 8", tags:"webix", comments:[{text:"Comment 1"}, {text:"Comment 2"}], votes:5, personId: 4  },
  { id:9, status:"work", text:"Task 9", tags:"webix", votes:1, personId: 2},
  { id:10, status:"work", text:"Task 10", tags:"webix", comments:[{text:"Comment 1"}, {text:"Comment 2"}, {text:"Comment 3"}], votes:10, personId:1 },
  { id:11, status:"work", text:"Task 11", tags:"webix 2.5", votes:3, personId: 8 },
  { id:12, status:"done", text:"Task 12", votes:2 , personId: 8, image: "image002.jpg"},
  { id:13, status:"ready", text:"Task 14",  personId: 8}
];


const tasks = [
  {
    "progress": 0,
    "parent": "0",
    "text": "New one added",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "type": "task",
    "opened": 1,
    "id": "BjDgWWHBYgQZ80eV"
  },
  {
    "progress": 0,
    "parent": "0",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "id": "N3ju5zLJg7Cux9EG"
  },
  {
    "progress": 0,
    "parent": "0",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "id": "Wob5POu7RKzvAUqA"
  },
  {
    "progress": 0,
    "parent": "1",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "id": "Hwdya0Swzvqkqe24"
  },
  {
    "progress": 0,
    "parent": "1.2",
    "text": "",
    "start_date": "2018-06-11 00:00:00",
    "end_date": "2018-06-12 00:00:00",
    "duration": "1",
    "type": "task",
    "opened": 1,
    "id": "soqCCTVEmUcAAXSp"
  },
  {
    "progress": 0,
    "parent": "BjDgWWHBYgQZ80eV",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "id": "RY5glYzznyuDVUdw"
  },
  {
    "text": "Project A",
    "start_date": "2018-06-10 00:00:00",
    "duration": "6",
    "progress": 10,
    "parent": "0",
    "opened": 1,
    "type": "project",
    "details": "Weekly meeting required\nRoom 508",
    "position": 0,
    "end_date": "2018-06-16 00:00:00",
    "id": "1"
  },
  {
    "progress": 0,
    "parent": "1.3",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-10 00:00:00",
    "duration": "1",
    "position": 0,
    "type": "milestone",
    "opened": 1,
    "details": "4564645\n565656",
    "id": "CXYcwuI0Z9TmDMpF"
  },
  {
    "text": "Task 1",
    "start_date": "2018-06-10 00:00:00",
    "duration": 2,
    "progress": 0,
    "parent": "2",
    "position": 0,
    "id": "2.1"
  },
  {
    "text": "Subtask 1",
    "start_date": "2018-06-10 00:00:00",
    "duration": 1,
    "progress": 0,
    "parent": "3",
    "position": 0,
    "id": "3.1"
  },
  {
    "progress": 0,
    "parent": "qlardYRlXteQIcC5",
    "text": "1",
    "start_date": "2018-06-18 00:00:00",
    "end_date": "2018-06-19 00:00:00",
    "duration": "1",
    "position": 0,
    "type": "task",
    "details": "",
    "id": "2dRM2qBTUvaXkRpg"
  },
  {
    "text": "Project B",
    "start_date": "2018-06-10 00:00:00",
    "duration": 3,
    "progress": 0,
    "parent": "0",
    "type": "project",
    "position": 1,
    "id": "2"
  },
  {
    "text": "Approval",
    "start_date": "2018-06-11 00:00:00",
    "duration": "0",
    "parent": "1",
    "type": "milestone",
    "position": 1,
    "end_date": "2018-06-11 00:00:00",
    "opened": 1,
    "id": "1.2"
  },
  {
    "text": "Task 2",
    "start_date": "2018-06-11 00:00:00",
    "duration": 2,
    "progress": 0,
    "parent": "2",
    "position": 1,
    "id": "2.2"
  },
  {
    "text": "Subtask 2",
    "start_date": "2018-06-12 00:00:00",
    "duration": 1,
    "progress": 0,
    "parent": "3",
    "position": 1,
    "id": "3.2"
  },
  {
    "text": "Split parent task",
    "type": "task",
    "start_date": "2018-06-12 00:00:00",
    "duration": "7",
    "progress": 0,
    "parent": "0",
    "position": 2,
    "end_date": "2018-06-19 00:00:00",
    "id": "3"
  },
  {
    "text": "Coding",
    "start_date": "2018-06-12 00:00:00",
    "duration": "3",
    "progress": 20,
    "parent": "1",
    "details": "Contact Rob for details",
    "position": 2,
    "end_date": "2018-06-15 00:00:00",
    "type": "task",
    "opened": 1,
    "id": "1.3"
  },
  {
    "progress": 0,
    "parent": "BjDgWWHBYgQZ80eV",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "position": 2,
    "type": "task",
    "opened": 1,
    "id": "3LIboOnLoTIJE5np"
  },
  {
    "text": "Testing",
    "start_date": "2018-06-15 00:00:00",
    "duration": "1",
    "progress": 0,
    "parent": "1",
    "details": "Desktop, mobile",
    "position": 3,
    "end_date": "2018-06-16 00:00:00",
    "type": "task",
    "id": "1.4"
  },
  {
    "text": "Fixing",
    "start_date": "2018-06-14 00:00:00",
    "duration": 1,
    "progress": 0,
    "parent": "1",
    "position": 4,
    "id": "1.5"
  },
  {
    "text": "Deploy",
    "start_date": "2018-06-15 00:00:00",
    "duration": 0,
    "parent": "1",
    "type": "milestone",
    "position": 5,
    "id": "1.6"
  },
  {
    "text": "Design",
    "start_date": "2018-06-11 00:00:00",
    "duration": "1",
    "progress": 85,
    "parent": "1",
    "position": 6,
    "end_date": "2018-06-12 00:00:00",
    "type": "task",
    "id": "1.1"
  },
  {
    "progress": 0,
    "parent": "1.2",
    "text": "",
    "start_date": "2018-06-12 00:00:00",
    "end_date": "2018-06-13 00:00:00",
    "duration": "1",
    "position": null,
    "type": "task",
    "opened": 0,
    "id": "BawLbckbz2ZIzKch"
  },
  {
    "progress": 92,
    "parent": "3LIboOnLoTIJE5np",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "position": null,
    "type": "task",
    "details": "",
    "id": "jH3kLqd1KnoxxbtO"
  },
  {
    "progress": 0,
    "parent": "9uF3sn5hjylr0NUE",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "position": null,
    "id": "dZSl6r09XpNdMJnz"
  },
  {
    "progress": 0,
    "parent": "BawLbckbz2ZIzKch",
    "text": "",
    "start_date": "2018-06-12 00:00:00",
    "end_date": "2018-06-13 00:00:00",
    "duration": "1",
    "position": null,
    "type": "task",
    "opened": 0,
    "id": "KNpliDakE52GSIqP"
  },
  {
    "progress": 0,
    "parent": "CXYcwuI0Z9TmDMpF",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "position": null,
    "id": "rp179bOUT8GMPZeO"
  },
  {
    "progress": 0,
    "parent": "CdLBEIGLzylC6C1v",
    "text": "aaaaaaaaaaaaaa",
    "start_date": "2018-06-11 00:00:00",
    "end_date": "2018-06-12 00:00:00",
    "duration": "1",
    "position": null,
    "type": "task",
    "details": "",
    "id": "BIVohGUfCGalt7Z8"
  },
  {
    "progress": 0,
    "parent": "KHhoqNquUFxJDwm1",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "position": null,
    "id": "SSI0WQQzRtO2LVkC"
  },
  {
    "progress": 0,
    "parent": "KNpliDakE52GSIqP",
    "text": "",
    "start_date": "2018-06-12 00:00:00",
    "end_date": "2018-06-13 00:00:00",
    "duration": "1",
    "position": null,
    "id": "8EpHrwI2Ue7v5qZT"
  },
  {
    "progress": 0,
    "parent": "O1WtgZ5bxjFQk5rQ",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "position": null,
    "id": "GSVldKz0cNojnTZd"
  },
  {
    "progress": 0,
    "parent": "RfLpqycYneb0T0Av",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-10 00:00:00",
    "duration": "1",
    "position": null,
    "type": "project",
    "details": "",
    "opened": 1,
    "id": "sp2h4jjvEzthZ5gM"
  },
  {
    "progress": 0,
    "parent": "WzPoRXgfOfvxq7T1",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "position": null,
    "type": "task",
    "opened": 1,
    "id": "9uF3sn5hjylr0NUE"
  },
  {
    "progress": 0,
    "parent": "WzPoRXgfOfvxq7T1",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "position": null,
    "type": "task",
    "opened": 1,
    "id": "O1WtgZ5bxjFQk5rQ"
  },
  {
    "progress": 0,
    "parent": "qlardYRlXteQIcC5",
    "text": "",
    "start_date": "2018-06-10 00:00:00",
    "end_date": "2018-06-11 00:00:00",
    "duration": "1",
    "position": null,
    "type": "task",
    "opened": 1,
    "id": "KHhoqNquUFxJDwm1"
  },
  {
    "progress": 0,
    "parent": "soqCCTVEmUcAAXSp",
    "text": "",
    "start_date": "2018-06-11 00:00:00",
    "end_date": "2018-06-12 00:00:00",
    "duration": "1",
    "position": null,
    "type": "task",
    "opened": 1,
    "id": "CdLBEIGLzylC6C1v"
  }
];

const resources = [
  {
    "name": "John",
    "category_id": "1",
    "avatar": "https://docs.webix.com/usermanager-backend/users/101/avatar/092352563.jpg",
    "id": "1"
  },
  {
    "name": "Mike",
    "category_id": "2",
    "id": "2"
  },
  {
    "name": "Anna Meyer",
    "category_id": "2",
    "avatar": "https://docs.webix.com/usermanager-backend/users/98/avatar/909471384.jpg",
    "id": "3"
  },
  {
    "name": "Alexander Thompson",
    "category_id": "2",
    "avatar": "https://docs.webix.com/usermanager-backend/users/102/avatar/898151818.jpg",
    "id": "4"
  },
  {
    "name": "Mark",
    "category_id": "1",
    "id": "5"
  },
  {
    "name": "Leonard",
    "category_id": "1",
    "id": "6"
  },
  {
    "name": "Alina",
    "category_id": "3",
    "id": "7"
  },
  {
    "name": "Stephan",
    "category_id": "3",
    "id": "8"
  }
];

const categories = [
  {
    "name": "QA",
    "unit": "hour",
    "id": "1"
  },
  {
    "name": "Development",
    "unit": "hour",
    "id": "2"
  },
  {
    "name": "Design",
    "unit": "hour",
    "id": "3"
  }
];

const assignments = [
  {
    "task": "BjDgWWHBYgQZ80eV",
    "resource": "3",
    "value": 4,
    "id": "11"
  },
  {
    "task": "1.3",
    "resource": "3",
    "value": 4,
    "id": "1"
  },
  {
    "task": "1.3",
    "resource": "4",
    "value": 8,
    "id": "2"
  },
  {
    "task": "1.1",
    "resource": "8",
    "value": 8,
    "id": "3"
  },
  {
    "task": "1.4",
    "resource": "5",
    "value": 8,
    "id": "4"
  },
  {
    "resource": "3",
    "value": 8,
    "task": "1.1",
    "id": "LYaqnOYLIMxfOF7f"
  }
];

const links = [
  {
    "id": "HWPmyD8QUPl45qyT",
    "source": "3.1",
    "target": "3.2",
    "type": 0
  },
  {
    "source": "1.2",
    "target": "1.3",
    "type": 0,
    "id": "KMqtPvhyxx3fshU5"
  },
  {
    "source": "qlardYRlXteQIcC5",
    "target": "2dRM2qBTUvaXkRpg",
    "type": 0,
    "id": "M3JygQkBjOPOQKp7"
  },
  {
    "source": "1.1",
    "target": "1.3",
    "type": 2,
    "id": "N3sOqNLOKnP6RNyh"
  },
  {
    "id": "fETWQ9WksAP4Uq4y",
    "source": "1.5",
    "target": "1.6",
    "type": 0
  },
  {
    "id": "lPitrXnxLh4pTjsk",
    "source": "1",
    "target": "2",
    "type": 1
  },
  {
    "source": "1.3",
    "target": "1.4",
    "type": 0,
    "id": "pscdNyyhTJryfOpi"
  }
];
