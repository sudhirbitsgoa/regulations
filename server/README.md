Api to get Regualtions and functions:
http://35.244.44.234:3001/api/RegulationsFunctionsMappings

Api to get questions for specific regulation and function
http://35.244.44.234:3001/api/RegulationsQuestionsMappings?filter={"where":{"regulation":{"inq":["AICPA\nSOC 2\n(2016)"]}},"func":["asf","asfd"]}


curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ \ 
   "realm": "string", \ 
   "username": "sudhirbaru", \ 
   "email": "sudhirbaru%40rr.com", \ 
   "emailVerified": true, \ 
 "password":"password" \ 
 }' 'http://localhost:3000/api/Users?access_token=aDEeVlAP4Uwgt2PamwiahBSMC4zwy2sInSLFywF3nbRjRV6GiOK8G86MXggN9zP2'



curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{  "email": "sudhirbaru%40rr.com","password":"password"}' 'http://localhost:3000/api/Users/login?access_token=aDEeVlAP4Uwgt2PamwiahBSMC4zwy2sInSLFywF3nbRjRV6GiOK8G86MXggN9zP2'


