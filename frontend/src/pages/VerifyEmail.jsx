import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function VerifyEmail() {

    const [message, setMessage] = useState("Verifying...");

    const [searchParams] = useSearchParams();

    useEffect(() => {

        const token = searchParams.get("sv_token");

        const API_BASE =import.meta.env.VITE_API_BASE_URL + "/api";

    fetch(`${API_BASE}/auth/verify-email?token=${token}`)
            .then(async (res) => {

                if (res.ok) {
                    setMessage("Email verified successfully");
                } else {
                    setMessage("Verification failed");
                }

            })
            .catch(() => {
                setMessage("Something went wrong");
            });

    }, []);

    return (
        <div style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "24px"
        }}>
            {message}
        </div>
    );
}