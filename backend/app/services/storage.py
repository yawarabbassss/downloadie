import datetime
import os
import shutil
import time
from typing import Optional, Tuple
from app.core.config import settings
from app.core.security import sanitize_filename


class StorageManager:
    """Manages ephemeral local storage for media downloads and cleanups."""

    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = os.path.abspath(base_dir or settings.storage_dir)
        os.makedirs(self.base_dir, exist_ok=True)

    def get_job_directory(self, job_id: str) -> str:
        """Return dedicated directory path for a job."""
        safe_job_id = sanitize_filename(job_id)
        job_dir = os.path.join(self.base_dir, safe_job_id)
        os.makedirs(job_dir, exist_ok=True)
        return job_dir

    def get_job_file_path(self, job_id: str, filename: str) -> str:
        """Return safe path for a file inside a job's folder."""
        job_dir = self.get_job_directory(job_id)
        clean_name = sanitize_filename(filename)
        return os.path.join(job_dir, clean_name)

    def file_exists(self, job_id: str, filename: str) -> bool:
        path = self.get_job_file_path(job_id, filename)
        return os.path.isfile(path)

    def get_file_info(self, job_id: str, filename: str) -> Optional[dict]:
        path = self.get_job_file_path(job_id, filename)
        if not os.path.isfile(path):
            return None
        stat = os.stat(path)
        return {
            "path": path,
            "size": stat.st_size,
            "created_at": stat.st_ctime,
            "modified_at": stat.st_mtime,
        }

    def delete_job(self, job_id: str) -> bool:
        """Remove job folder and all its contents."""
        safe_job_id = sanitize_filename(job_id)
        job_dir = os.path.join(self.base_dir, safe_job_id)
        if os.path.isdir(job_dir):
            try:
                shutil.rmtree(job_dir, ignore_errors=True)
                return True
            except Exception:
                return False
        return False

    def cleanup_expired_files(self, max_age_minutes: Optional[int] = None) -> int:
        """
        Delete files and directories older than max_age_minutes.
        Returns number of pruned job folders.
        """
        age_limit = (max_age_minutes or settings.job_expiration_minutes) * 60
        now = time.time()
        pruned_count = 0

        if not os.path.isdir(self.base_dir):
            return 0

        for item in os.listdir(self.base_dir):
            item_path = os.path.join(self.base_dir, item)
            try:
                stat = os.stat(item_path)
                if now - stat.st_mtime > age_limit:
                    if os.path.isdir(item_path):
                        shutil.rmtree(item_path, ignore_errors=True)
                    else:
                        os.remove(item_path)
                    pruned_count += 1
            except Exception:
                continue

        return pruned_count

    def get_storage_stats(self) -> dict:
        """Return total size and item count in ephemeral storage."""
        total_size = 0
        file_count = 0
        if os.path.isdir(self.base_dir):
            for root, _, files in os.walk(self.base_dir):
                for f in files:
                    fp = os.path.join(root, f)
                    try:
                        total_size += os.path.getsize(fp)
                        file_count += 1
                    except Exception:
                        pass
        return {
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "file_count": file_count,
            "storage_dir": self.base_dir,
        }


storage_manager = StorageManager()
