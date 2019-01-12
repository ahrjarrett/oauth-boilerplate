# SSL

We need to set up an SSL certificate during development if we want to work with Facebook OAuth.

## Frontend Setup:

Frontend: For create-react-app we just pass `HTTPS=true` to our start script and it handles the certificate for us (different for Windows!)

## Backend Setup:

Yep, there's some set up.

### Generate the Certificate

1. Generate a RSA-2048 key and save it to rootCA.key, remembering the password you enter when prompted:

   ```
   $ openssl genrsa -des3 -out rootCA.key 2048
   ```

2. Now create a new Root SSL Certificate (rootCA.pem) from the key:

   ```
   $ openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem
   ```

3. Make the Root SSL Certificate Trustworthy

   On OS X:

   - Open Keychain app, go to "System" keychain and do File > Import Items
   - Upload rootCA.pem
   - Double click uploaded certificate and change Trust levels to **Always Trust**

4) Issue a Domain Certificate for localhost

   - Create an OpenSSL config file called `server.csr.cnf` and change the following values as needed:

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

   - Create a `v3.ext` file, noticing the `subjectAltName` field ([subjectAltName FAQ](http://wiki.cacert.org/FAQ/subjectAltName)):

     ```
     authorityKeyIdentifier=keyid,issuer
     basicConstraints=CA:FALSE
     keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
     subjectAltName = @alt_names

     [alt_names]
     DNS.1 = localhost
     ```

   - Create certificate key for localhost

     Create a certificate key for localhost using the configuration settings stored in server.csr.cnf. This key is stored in `server.key`:

     ```
     $ openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf )
     ```

   - Finally, generate your `server.crt` file:

     ```
     $ openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext
     ```

### Use the certificate

Move `server.key` and `server.crt` to your project and spin up an `httpsServer` instance. Here's an example configuration:

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

var server = https.createServer(certOptions, app).listen(443);
```

Finally, _make sure_ you're going to https://localhost/8080 (or your port), not http. You should see the green lock.

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

# Google

- Project: oauth-test-2-trash
- App name: backwoods-test-2
- Console: https://console.developers.google.com/apis/credentials?project=oauth-test-2-trash
- Email: ahrjarrett@gmail.com
- Client ID: oauth-test-2-trash-client
- Authorized JavaScript origins: https://localhost:3000
- Authorized Redirect URIs: https://localhost:8080/google/callback

# Facebook

- App name: backwoods-test-2
- Console: https://developers.facebook.com/apps/542728262890874/fb-login/settings/
- Email: solidstater@gmail.com
- Products: Facebook Login (unconfigured)
- Valid OAuth Redirect URIs: https://localhost:8080/facebook/callback

# Github

- App name: backwoods-test-2-trash
- Console: https://github.com/settings/applications/966052
- Homepage URL: https://localhost:3000
- Authorization callback URL: https://localhost:8080/github/callback

# Deployment

- App URL: https://backwoods-oauth.herokuapp.com
