// import { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";

// export default function VerifyEmail() {

//     const [message, setMessage] = useState("Verifying...");

//     const [searchParams] = useSearchParams();

//     useEffect(() => {

//         const token = searchParams.get("token");

//         console.log("TOKEN =", token);

//         const API_BASE =import.meta.env.VITE_API_BASE_URL + "/api";

//     fetch(`${API_BASE}/auth/verify-email?token=${token}`)
//             .then(async (res) => {

//                 if (res.ok) {
//                     setMessage("Email verified successfully");
//                 } else {
//                     setMessage("Verification failed");
//                 }

//             })
//             .catch(() => {
//                 setMessage("Something went wrong");
//             });

//     }, []);

//     return (
//         <div style={{
//             height: "100vh",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             fontSize: "24px"
//         }}>
//             {message}
//         </div>
//     );
// }
// import { useEffect, useState } from "react";

// export default function VerifyEmail() {

//     const [message, setMessage] = useState("Verifying...");

//     useEffect(() => {

//         const token =
//             new URLSearchParams(window.location.search)
//                 .get("token");

//         console.log("TOKEN =", token);

//         const API_BASE =
//             import.meta.env.VITE_API_BASE_URL + "/api";

//         fetch(`${API_BASE}/auth/verify-email?token=${token}`)
//             .then((res) => {
//                 if (res.ok) {
//                     setMessage("Email verified successfully");
//                 } else {
//                     setMessage("Verification failed");
//                 }
//             })
//             .catch(() => {
//                 setMessage("Something went wrong");
//             });

//     }, []);

//     return (
//         <div
//             style={{
//                 height: "100vh",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 fontSize: "24px"
//             }}
//         >
//             {message}
//         </div>
//     );
// }
// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// export default function VerifyEmail() {

//     const [message, setMessage] = useState("Verifying...");
//     const hasRun = useRef(false);
//      const navigate = useNavigate();

//     useEffect(() => {

//         if (hasRun.current) return;
//         hasRun.current = true;

//         const token =
//             new URLSearchParams(window.location.search)
//                 .get("token");

//         const API_BASE =
//             import.meta.env.VITE_API_BASE_URL + "/api";

//         fetch(`${API_BASE}/auth/verify-email?token=${token}`)
//             .then(async (res) => {
//                 const text = await res.text();

//                 if (res.ok) {
//                     setMessage(text || "Email verified successfully");
//                     setTimeout(() => {
//                         window.history.pushState({},"","/");
//                         onNav("login");
//                     }, 3000);
//                 } else {
//                     setMessage(text || "Verification failed");
//                 }
//             })
//             .catch(() => {
//                 setMessage("Something went wrong");
//             });

//     }, []);

//     return (
//         <div
//             style={{
//                 height: "100vh",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 fontSize: "24px"
//             }}
//         >
//             {message}
//         </div>
//     );
// }
import { useEffect, useRef, useState } from "react";

export default function VerifyEmail() {

    const [message, setMessage] = useState("Verifying...");
    const [countdown, setCountdown] = useState(3);
    const hasRun = useRef(false);

    useEffect(() => {

        if (hasRun.current) return;
        hasRun.current = true;

        const token =
            new URLSearchParams(window.location.search)
                .get("token");

        const API_BASE =
            import.meta.env.VITE_API_BASE_URL + "/api";

        fetch(`${API_BASE}/auth/verify-email?token=${token}`)
            .then(async (res) => {

                const text = await res.text();

                if (res.ok) {

                    setMessage(
                        text || "Email verified successfully"
                    );

                    let seconds = 3;

                    const interval = setInterval(() => {

                        seconds--;

                        setCountdown(seconds);

                        if (seconds <= 0) {

                            clearInterval(interval);

                            window.location.href = "/";

                        }

                    }, 1000);

                } else {

                    setMessage(
                        text || "Verification failed"
                    );
                }
            })
            .catch(() => {
                setMessage("Something went wrong");
            });

    }, []);

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#0a0c10",
                color: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: "20px"
            }}
        >
            <div>

                <div
                    style={{
                        fontSize: "80px",
                        marginBottom: "20px"
                    }}
                >
                    🎉
                </div>

                <h1
                    style={{
                        fontSize: "38px",
                        marginBottom: "10px"
                    }}
                >
                    Email Verified!
                </h1>

                <p
                    style={{
                        color: "#a0a0a0",
                        fontSize: "18px",
                        marginBottom: "20px"
                    }}
                >
                    Welcome to SecureVault
                </p>

                <p
                    style={{
                        color: "#4f8ef7",
                        fontSize: "16px"
                    }}
                >
                    Redirecting to login in {countdown}...
                </p>

            </div>
        </div>
    );
}