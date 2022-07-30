const Item = ({title, value, bgColour}) => {
    return (
        <div className={`bg-${bgColour}-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
            <div className="text-sm font-medium text-gray-500">
                {title}
            </div>
            <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {value}
            </div>
        </div>
    )
}

export default function ManagedCourseCard({course, children}) {
    return (
        <div className="bg-white border shadow overflow-hidden sm:rounded-lg mb-3">
            <div className="border-t border-gray-200">
                {Object.keys(course).map((key, index) => {
                    // console.log(key);
                    return <Item title={`${key[0].toUpperCase()}${key.slice(1)}`} value={course[key]}
                                 bgColour={index % 2 === 0 ? "white" : "gray"}/>
                })}
                <div className="bg-white-50 px-4 py-5 sm:px-6">
                    {children}
                </div>
            </div>
        </div>
    )
}