const ProfileSection = ({
    user = {
        fullName: "Harshit",
        email: "harshit@example.com",
        defaultSignature: "Best regards,\nHarshit\nSoftware Engineer",
    },
}) => {
    return (
        <div className="space-y-6">
            {/* Profile Picture & Basic Info */}
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {user.fullName.charAt(0)}
                </div>
                <div>
                    <h3 className="text-xl font-semibold">{user.fullName}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Change Avatar
                    </button>
                </div>
            </div>

            {/* Email Signature */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Default Email Signature
                </label>
                <textarea
                    className="w-full h-24 p-3 border rounded-lg"
                    placeholder="Best regards,&#10;Your Name&#10;Your Title"
                    value={user.defaultSignature}
                />
            </div>

            {/* Preferences */}
            {/* <div className="grid grid-cols-2 gap-4">
                {/* <div>
                    <label className="block text-sm font-medium mb-2">
                        Timezone
                    </label>
                    <select className="w-full p-2 border rounded-lg">
                        <option>UTC-5 (Eastern Time)</option>
                        <option>UTC+0 (GMT)</option>
                        <option>UTC+5:30 (India)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Language
                    </label>
                    <select className="w-full p-2 border rounded-lg">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                    </select>
                </div>
            </div> */}
        </div>
    );
};

export default ProfileSection;
