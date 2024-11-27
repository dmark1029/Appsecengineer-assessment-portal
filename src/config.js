const environments = {
  assessments: {
    testURLApi: 'https://j0u9ovucy2.execute-api.us-east-2.amazonaws.com/prod/',
    userPortalURLApi: 'https://vhckklb1xf.execute-api.us-east-2.amazonaws.com/prod/',
    provisionerUrl: 'https://kbgtw5nb85.execute-api.us-east-2.amazonaws.com/prod/',
    challengeUrl: 'https://w8w0zirqti.execute-api.us-east-2.amazonaws.com/prod/',
    quizUrl: 'https://32d8fx0t13.execute-api.us-east-2.amazonaws.com/prod',
    signInUrl: 'https://j0u9ovucy2.execute-api.us-east-2.amazonaws.com/prod/'
  },
  uat: {
    testURLApi: 'https://jpekencwud.execute-api.us-west-1.amazonaws.com/uat/',
    userPortalURLApi: 'https://0tcy9w9c95.execute-api.us-west-1.amazonaws.com/uat/',
    provisionerUrl: 'https://nace643xe0.execute-api.us-west-1.amazonaws.com/uat/',
    challengeUrl: 'https://i77i9zva54.execute-api.us-west-1.amazonaws.com/uat/',
    quizUrl: 'https://08b1ivq1g7.execute-api.us-west-1.amazonaws.com/uat',
    signInUrl: 'https://jpekencwud.execute-api.us-west-1.amazonaws.com/uat/'
  },
  staging: {
    testURLApi: 'https://cyvrklphx1.execute-api.us-east-2.amazonaws.com/staging/',
    userPortalURLApi: 'https://m6d6yt7pie.execute-api.us-east-2.amazonaws.com/staging/',
    provisionerUrl: 'https://h19cb5qx00.execute-api.us-east-2.amazonaws.com/staging/',
    challengeUrl: 'https://9ismepcb43.execute-api.us-east-2.amazonaws.com/staging/',
    quizUrl: 'https://91gulcsfbg.execute-api.us-east-2.amazonaws.com/staging/',
    signInUrl: 'https://cyvrklphx1.execute-api.us-east-2.amazonaws.com/staging/'
  }
}

const subdomain = window.location.hostname.split('.')[0]
const config = environments[subdomain] || environments.staging

export default config
