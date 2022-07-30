import ActiveLink from "../activelink";

const BreadCrumbs = ({items, isAdmin}) => {
    return (
        <nav aria-label="breadcrumb" className="mb-4">
            <ol className="flex leading-none divide-x divide-gray-400">
                {items.map((item, index) => (
                    <div key={index}>
                        {!item.requireAdmin || (item.requireAdmin && isAdmin) ? (
                            <li className={`${index === 2 ? "pl-4" : "px-4"} font-medium text-gray-500 hover:text-gray-900`}>
                                <ActiveLink href={item.href}><a>{item.value}</a></ActiveLink>
                            </li>
                        ) : null
                        }
                    </div>
                ))}
            </ol>
        </nav>
    );
};

export default BreadCrumbs;
