const helpRequestFixtures = {
    oneRequest: {
        "id": 1,
        "requesterEmail": "temp@ucsb.edu",
        "teamId": "4",
        "tableOrBreakoutRoom": "7",
        "requestTime": "2022-01-02T12:00:00",
        "explanation": "swagger",
        "solved": false
    },
    threeRequests: [
        {
            "id": 1,
            "requesterEmail": "temp@ucsb.edu",
            "teamId": "4",
            "tableOrBreakoutRoom": "7",
            "requestTime": "2022-01-02T12:00:00",
            "explanation": "swagger",
            "solved": false
        },
        {
            "id": 2,
            "requesterEmail": "temp2@ucsb.edu",
            "teamId": "5",
            "tableOrBreakoutRoom": "8",
            "requestTime": "2022-01-02T12:00:00",
            "explanation": "dokku",
            "solved": false
        },
        {
            "id": 3,
            "requesterEmail": "temp3@ucsb.edu",
            "teamId": "6",
            "tableOrBreakoutRoom": "9",
            "requestTime": "2022-01-02T12:00:00",
            "explanation": "deployment",
            "solved": true
        }
    ]
};


export { helpRequestFixtures };