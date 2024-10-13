from mongoengine import signals, Document
from main.libraries.functions import encrypt_text, decrypt_text

class EncryptedDocumentMeta(type(Document)):
    def __new__(cls, name, bases, attrs):
        new_class = super(EncryptedDocumentMeta, cls).__new__(cls, name, bases, attrs)
        if name != 'EncryptedDocument':  # Prevent connecting signals to the abstract base class
            signals.pre_save.connect(new_class.pre_save, sender=new_class)
            signals.post_init.connect(new_class.post_init, sender=new_class)
        return new_class

class EncryptedDocument(Document, metaclass=EncryptedDocumentMeta):
    meta = {'abstract': True}

    @classmethod
    def pre_save(cls, sender, document, **kwargs):
        encrypted_fields = document._meta.get('encrypted_fields', [])
        for field in encrypted_fields:
            original_value = getattr(document, field, None)
            if original_value is not None:  # Only encrypt if there's a value
                encrypted_value = encrypt_text(original_value)
                setattr(document, field, encrypted_value)

    @classmethod
    def post_init(cls, sender, document, **kwargs):
        encrypted_fields = document._meta.get('encrypted_fields', [])
        for field in encrypted_fields:
            encrypted_value = getattr(document, field, None)
            # Only attempt decryption if the value appears to be encrypted
            if encrypted_value and isinstance(encrypted_value, str) and len(encrypted_value) > 40:
                decrypted_value = decrypt_text(encrypted_value)
                setattr(document, field, decrypted_value)
