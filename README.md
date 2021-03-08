# Signature generator for Insomnia
- How to use:
    - Install the plugin in Insomnia (Applications->Preferences->Plugins)
    - Set the environment variable `private-key` to the RSA-SHA256 key
    - For the requests that require the signature, you'll need to include the header `X-Brad-Headers` with the value `true`
    - Make sure the authentication bearer token is set
