import { useTheme } from "../contexts/ThemeContext";

const CommandHelp = () => {
    const { currentColors, currentPalette } = useTheme();

    return (
        <div className="mt-2 p-2" style={{ backgroundColor: currentColors.bg + "90", color: currentColors.text }}>
            <div className="font-medium" style={{ color: currentPalette.primary }}>
                Available Commands:
            </div>
            <div className="">
                /email - Generate and send an email
                <br />
                /clear - Clear chat history
            </div>
            <div className="mt-2 text-xs">
                #confident - Use confident tone
                <br />
                #formal - Use formal tone
                <br />
                #casual - Use casual tone
            </div>
        </div>
    );
};

export default CommandHelp;
