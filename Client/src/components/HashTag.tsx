interface HashTagProps {
    hashTag: string;
    setHashTag: React.Dispatch<React.SetStateAction<string>>;
}

const HashTag = ({ hashTag, setHashTag }: HashTagProps) => {
    return (
        <div className="select-none">
            <span className="text-xs text-gray-600 font-bold dark:text-white">Tag: </span>
            {hashTag ? (
                <>
                    <span className="text-xs text-blue-400 bg-blue-50 px-1 rounded-full">
                        {hashTag}
                    </span>
                    <button
                        onClick={() => setHashTag("")}
                        className="text-xs text-red-400 bg-red-50 hover:bg-red-100 px-1 rounded-full cursor-pointer ml-1"
                    >
                        Remove
                    </button>
                </>
            ) : (
                <span className="text-xs text-blue-400 bg-blue-50 px-1 rounded-full">
                    None
                </span>
            )}
        </div>
    );
};

export default HashTag;
