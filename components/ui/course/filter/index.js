import Button from "../../common/button/index";
import {useState} from "react";

const OPTIONS = ["all", "purchased", "activated", "deactivated"];

export default function CourseFilter({onSearchSubmit, onFilterSelected}) {
    const [searchText, setSearchText] = useState("");

    return (
        <div className="flex items-center my-4 xs:flex-col md:flex-row ">
            <div className="flex mr-2 relative rounded-md">
                <input
                    type="text"
                    name="courseHash"
                    id="courseHash"
                    className="md:w-52 xs:w-96 focus:ring-indigo-500 shadow-md focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0x2341ab..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <Button
                    onClick={() => onSearchSubmit(searchText)}>
                    Search
                </Button>
            </div>
            <div className="relative text-gray-700">
                <select
                    className="w-72 h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline"
                    placeholder="Regular input"
                    onChange={(e) => onFilterSelected(e.target.value)}>
                    {OPTIONS.map((value, index) => (
                        <option key={index} value={value}>{`${value[0].toUpperCase()}${value.slice(1)}`}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd" fillRule="evenodd"></path>
                    </svg>
                </div>
            </div>
        </div>
    )
}