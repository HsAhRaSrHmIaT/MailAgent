const SecuritySettings = () => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Security & Privacy</h3>

            {/* Password Change */}
            <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Change Password</h4>
                <div className="space-y-3">
                    <input
                        type="password"
                        placeholder="Current password"
                        className="w-full p-2 border rounded-lg"
                    />
                    <input
                        type="password"
                        placeholder="New password"
                        className="w-full p-2 border rounded-lg"
                    />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Update Password
                    </button>
                </div>
            </div>

            {/* Data Privacy */}
            <div className="space-y-3">
                <h4 className="font-medium">Data & Privacy</h4>
                <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Allow AI to learn from my email patterns</span>
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Save conversation history for 30 days</span>
                </label>
                <button className="text-red-600 hover:text-red-700 text-sm">
                    Delete All My Data
                </button>
            </div>

            {/* Active Sessions */}
            <div>
                <h4 className="font-medium mb-3">Active Sessions</h4>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <div className="font-medium">Current Session</div>
                            <div className="text-sm text-gray-600">
                                Windows • Chrome • New York
                            </div>
                        </div>
                        <span className="text-green-600 text-sm">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
