import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import EmailForm from "./pages/EmailForm";
import GetDB from "./pages/GetDB";

function App() {
    return (

        <Router>
            <Routes>
                <Route path="/" element={<EmailForm />} />
                <Route path="/email-form" element={<EmailForm />} />
                <Route path="/get-db" element={<GetDB />} />
            </Routes>
        </Router>
    );
}

export default App;
