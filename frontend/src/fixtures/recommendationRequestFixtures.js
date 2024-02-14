const recommendationRequestFixtures = {
    oneRecommendationRequest:
    [
      {
       "id": 1,
        "requesterEmail": "johnsmith@ucsb.edu",
        "professorEmail": "brianbaker@ucsb.edu",
        "explanation": "BS/MS Program UCSB",
        "dateRequested": "2020-02-14T12:34:05",
        "dateRequested": "2020-03-14T11:59:59",
        "done": true      
      }
    ],

    threeRecommendationRequests:
    [
        {
            "id": 2,
            "requesterEmail": "jeangenshin@ucsb.edu",
            "professorEmail": "bronyahonkai@ucsb.edu",
            "explanation": "PhD CS Stanford",
            "dateRequested": "2021-01-23T17:22:17",
            "dateRequested": "2021-03-01T12:00:00",
            "done": true     
        },

        {
            "id": 3,
            "requesterEmail": "tylercreator@ucsb.edu",
            "professorEmail": "frankocean@ucsb.edu",
            "explanation": "PhD CE Cal Tech",
            "dateRequested": "2022-11-20T01:12:01",
            "dateRequested": "2022-11-21T20:15:45",
            "done": false 
        },

        {
            "id": 4,
            "requesterEmail": "jjoestar@ucsb.edu",
            "professorEmail": "jseinfeld@ucsb.edu",
            "explanation": "PhD ME Princeton",
            "dateRequested": "2023-09-17T05:45:06",
            "dateRequested": "2023-10-30T18:25:51",
            "done": false    
        },
        
    ]
};

export { recommendationRequestFixtures };