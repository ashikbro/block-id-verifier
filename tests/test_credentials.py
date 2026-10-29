from block_id import issue, verify


def test_credential_verification_detects_tampering():
    credential = issue("user-1", "issuer-1", {"degree": "engineering"}, b"secret")
    assert verify(credential, b"secret")
    assert not verify(credential, b"wrong")
    tampered = credential.__class__(
        credential.subject, credential.issuer, {"degree": "medicine"}, credential.signature
    )
    assert not verify(tampered, b"secret")
