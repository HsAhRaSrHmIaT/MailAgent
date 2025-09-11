// interface AIPreferencesProps {
//     selectedTone: string;
// }

// const AIPreferences = ({ selectedTone }: AIPreferencesProps) => {
//     return (
//         <div className="space-y-6">
//             <h3 className="text-lg font-semibold">MailAgent AI Settings</h3>

//             {/* Default Tone */}
//             <div>
//                 <label className="block text-sm font-medium mb-2">
//                     Default Email Tone
//                 </label>
//                 <div className="grid grid-cols-3 gap-2">
//                     {["Professional", "Friendly", "Casual"].map((tone) => (
//                         <button
//                             key={tone}
//                             className={`p-3 rounded-lg border ${
//                                 selectedTone === tone
//                                     ? "border-blue-500 bg-blue-50"
//                                     : "border-gray-200"
//                             }`}
//                         >
//                             {tone}
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             {/* Response Length */}
//             <div>
//                 <label className="block text-sm font-medium mb-2">
//                     Preferred Response Length
//                 </label>
//                 <select className="w-full p-2 border rounded-lg">
//                     <option>Brief (1-2 sentences)</option>
//                     <option>Standard (1 paragraph)</option>
//                     <option>Detailed (2-3 paragraphs)</option>
//                 </select>
//             </div>

//             {/* Auto-suggestions */}
//             <div className="space-y-3">
//                 <label className="flex items-center gap-2">
//                     <input type="checkbox" className="rounded" />
//                     <span>Enable smart reply suggestions</span>
//                 </label>
//                 <label className="flex items-center gap-2">
//                     <input type="checkbox" className="rounded" />
//                     <span>Auto-detect email context</span>
//                 </label>
//                 <label className="flex items-center gap-2">
//                     <input type="checkbox" className="rounded" />
//                     <span>Suggest follow-up emails</span>
//                 </label>
//             </div>
//         </div>
//     );
// };

// export default AIPreferences;
