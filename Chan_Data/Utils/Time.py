from datetime import datetime, timedelta

def round_nearest_hour(time: datetime) -> datetime:
    return (time.replace(second=0, microsecond=0, minute=0, hour=time.hour) + timedelta(hours=time.minute//30))