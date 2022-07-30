import Link from "next/link";
import {cloneElement} from "react";
import {useRouter} from "next/router";

export default function ActiveLink({children, activeLinkClass, ...props}) {
    const { pathname } = useRouter();
    let className = children.props.className || "";

    if(pathname === props.href) {
        className += `${activeLinkClass ? ` ${activeLinkClass}` : " text-indigo-600 "}`;
    }
    return (
        <Link {...props}>
            {
                cloneElement(children, {className})
            }
        </Link>
    )
  ;
}