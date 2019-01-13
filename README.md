OAuth2 boilerplate configuration for Google, Facebook and Github implemented with React on the frontend and Passport and Express on the backend.

# Environment Variables

In the server directory make sure the following is defined:

```
FACEBOOK_KEY
FACEBOOK_SECRET
GOOGLE_KEY
GOOGLE_SECRET
GITHUB_KEY
GITHUB_SECRET
SESSION_SECRET
```

# Providers

### Google

- Project: oauth-test-2-trash
- App name: backwoods-test-2
- Console: https://console.developers.google.com/apis/credentials?project=oauth-test-2-trash
- Email: ahrjarrett@gmail.com
- Client ID: oauth-test-2-trash-client
- Authorized JavaScript origins: https://localhost:3000
- Authorized Redirect URIs: https://localhost:8080/google/callback

### Facebook

- App name: backwoods-test-2
- Console: https://developers.facebook.com/apps/542728262890874/fb-login/settings/
- Email: solidstater@gmail.com
- Products: Facebook Login (unconfigured)
- Valid OAuth Redirect URIs: https://localhost:8080/facebook/callback

### Github

- App name: backwoods-test-2-trash
- Console: https://github.com/settings/applications/966052
- Homepage URL: https://localhost:3000
- Authorization callback URL: https://localhost:8080/github/callback

# Deployment

- App URL: [https://backwoods-oauth.herokuapp.com](https://github.com/ahrjarrett/oauth-boilerplate/wake-up)

To set up deployment, go to the server directory and initialize a separate git repository there. Then just add heroku as a remote:

```
$ heroku git:remote -a backwoods-oauth
```

Make sure your production environment variables are set in the [Heroku Dashboard](https://dashboard.heroku.com/apps/backwoods-oauth/settings)

Then to deploy just commit and do:

```
$ git push heroku master
```

# SSL

We need to set up an SSL certificate during development if we want to work with Facebook OAuth.

This is the most annoying part, but it's really not bad.

Both frontend and backend have to be secure even in development, otherwise Facebook craps the bed.

Our backend cert will actually be signed and done legit but create-react-app (CRA) won't let us do our own certs without ejecting which fuck that, I'm fine with a little magic.

### Frontend Setup:

`$ yarn dev`

Runs `HTTPS=true react scripts start`, which is all you need to do.

Don't forget it's on `https` not `http`, that one got me for a while.

If Chrome complains go Advanced –> Proceed to Unsafety or whatever, also I recommend turning on Allow Insecure Certs on Localhost (see Troubleshooting below).

### Backend Setup:

Install openssl however you install things and do this:

#### Generate the Certificate

1. Generate a RSA-2048 key and save it to rootCA.key, don't forget your password because you'll need it:

   ```
   $ openssl genrsa -des3 -out rootCA.key 2048
   ```

2. Now create a new Root SSL Certificate (rootCA.pem) from the key:

   ```
   $ openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem
   ```

3. Make the Root SSL Certificate Trustworthy

   **On OS X:**

   - Open Keychain app, go to "System" keychain and do File –> Import Items
   - Upload rootCA.pem
   - Double click uploaded certificate and change Trust levels to **Always Trust**

#### Issue a Domain Certificate for localhost

1.  Create an OpenSSL config file called `server.csr.cnf` and change the following values as you see fit (you don't have to, but the `[dn]` section shows on the cert itself):

    ```
    [req]
    default_bits = 2048
    prompt = no
    default_md = sha256
    distinguished_name = dn

    [dn]
    C=US
    ST=RandomState
    L=RandomCity
    O=RandomOrganization
    OU=RandomOrganizationUnit
    emailAddress=hello@example.com
    CN = localhost
    ```

2.  Create a `v3.ext` file, the `subjectAltName` part is important — [see the altName docs](http://wiki.cacert.org/FAQ/subjectAltName) for info:

    ```
    authorityKeyIdentifier=keyid,issuer
    basicConstraints=CA:FALSE
    keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
    subjectAltName = @alt_names

    [alt_names]
    DNS.1 = localhost
    ```

3.  Create certificate key for localhost
    Create a certificate key for localhost using the configuration settings stored in server.csr.cnf. The cert key is stored in `server.key`:

    ```
    $ openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf )
    ```

4.  Last, generate the `server.crt` file:
    ```
    $ openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext
    ```

#### Use the certificate

Move `server.key` and `server.crt` to `server/certs` and spin up an `httpsServer` instance. For example:

```javascript
var path = require("path");
var fs = require("fs");
var express = require("express");
var https = require("https");

var certOptions = {
  key: fs.readFileSync(path.resolve("build/cert/server.key")),
  cert: fs.readFileSync(path.resolve("build/cert/server.crt"))
};

var app = express();

var server = https.createServer(certOptions, app).listen(8080);
```

Go to https://localhost/8080. You should see the green lock.

#### Troubleshooting:

- Turn on the **[Allow insecure certs on localhost](chrome://flags/#allow-insecure-localhost)** flag in Chrome. CRA "handles" the certs but doesn't expose them to you, so this flag makes it easier to ignore Chrome complaining throughout development.

- If your backend cert says its valid but you're not seeing green, do some digging in the DevTools:

  > DevTools –> Security –> View Certificate

- If you need to jog the browsers memory — sometimes it gets confused reading 2 root certs at the same damn time — flush local site data and close reopen the tab:
  > DevTools –> Application –> Clear Storage –> Clear Site Data
