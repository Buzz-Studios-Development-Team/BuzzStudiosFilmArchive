export function formLogObject(user_email, user_name, user_action, result) {
    return {
        "ip_address": "0.0.0.0",
        "user_email": user_email,
        "user_name": user_name,
        "user_action": user_action,
        "result": result
    };
}

export function publishLog(log) {
    if (log.ip_address !== undefined
        && log.user_email !== undefined
        && log.user_name !== undefined
        && log.user_action !== undefined
        && log.result !== undefined
    ) {
        fetch(process.env.REACT_APP_LOGGING_URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "timestamp": Math.floor((Date.now() / 1000)),
                "ip_address": log.ip_address,
                "user_email": log.user_email,
                "user_name": log.user_name,
                "user_action": log.user_action,
                "result": log.result
            })
        });
    }
    else {
        return false;
    }
}