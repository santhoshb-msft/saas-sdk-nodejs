// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// <IndexRouterSnippet>
var express = require('express');
var router = express.Router();
const axios = require('axios');

/* GET /landingpage */
// <GetRouteSnippet>
router.get('/',
  async function(req, res) {
    if (!req.isAuthenticated()) {
      // Redirect unauthenticated requests to home page
      req.session.returnTo = req.originalUrl;
      res.redirect('/auth/signin')
    } else if (!req.query.token) {
      let params = {
        message: 'Missing token in the query'
      }
        res.render('error', params);
    } else {
      let params = {
        active: { landingpage: false },
        token: req.query.token
      };

      // Get the access token
      reqURL = 'https://login.microsoftonline.com/'+process.env.OAUTH_TENANT_ID+'/oauth2/token';
      const bodyParams = new URLSearchParams();
      bodyParams.append('grant_type', 'client_credentials');
      bodyParams.append('client_id', process.env.OAUTH_APP_ID);
      bodyParams.append('client_secret', process.env.OAUTH_APP_PASSWORD);
      bodyParams.append('resource', process.env.MARKETPLACE_RESOURCE);
      headersData = {  'Content-Type': 'application/x-www-form-urlencoded' };
      
      const getAccessToken = async () => {
        try {
            return await axios.post(reqURL, bodyParams, headersData)
        } catch (error) {
          console.error(error)
        }
      }
      
      //Call Marketplace API
      const accessTokenRaw = await getAccessToken()
      console.log(accessTokenRaw.data.access_token)
      console.log(decodeURIComponent(req.query.token))
      
      resolveURL = 'https://marketplaceapi.microsoft.com/api/saas/subscriptions/resolve?api-version=2018-08-31';
      headersData = 
      { 
        'Content-Type': 'application/json',
        'authorization': 'Bearer '+ accessTokenRaw.data.access_token,
        'x-ms-marketplace-token': decodeURIComponent(req.query.token)
      };

      const getSubscriptionResolve = async () => {
        try {
            return await axios.post(process.env.MARKETPLACE_SUBSCRIPTION_RESOLVE_ENDPOINT, {}, {headers: headersData})
        } catch (error) {
          console.error(error)
        }
      }

      const resolveSubscriptionResult = await getSubscriptionResolve()
      console.log(resolveSubscriptionResult.data)
      
      params.resolvedSubscription = resolveSubscriptionResult.data;

      console.log(params)
      res.render('landingpage', params);
    }
  }
);
// </GetRouteSnippet>

module.exports = router;
// </IndexRouterSnippet>
