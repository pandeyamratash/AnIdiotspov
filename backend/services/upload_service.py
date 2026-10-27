
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

# Always save uploads relative to this Python file's project structure.
BACKEND_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BACKEND_DIR / "uploads"

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


async def save_image(file: UploadFile) -> dict:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Upload a JPG, PNG, WEBP, or GIF image.",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    extension = ALLOWED_TYPES[file.content_type]
    filename = f"{uuid.uuid4().hex}{extension}"
    destination = UPLOAD_DIR / filename

    size = 0

    try:
        with destination.open("wb") as output:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break

                size += len(chunk)

                if size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="Image must be 5 MB or smaller.",
                    )

                output.write(chunk)

        if size == 0:
            destination.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail="The image is empty.")

        return {
            "filename": filename,
            "url": f"/uploads/{filename}",
            "size": size,
            "content_type": file.content_type,
        }

    except Exception:
        destination.unlink(missing_ok=True)
        raise

    finally:
        await file.close()
