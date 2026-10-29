# Block ID Verifier

A signed credential-verification foundation for user-owned identity records.

## Current status

The repository includes standard-library HMAC credential issuance and
tamper-detection. Blockchain anchoring, wallets, key rotation, revocation, and
network APIs are not implemented yet; secrets must remain outside source
control.

## Development

```sh
python -m venv .venv
.venv/bin/pip install pytest
PYTHONPATH=src .venv/bin/pytest
```
