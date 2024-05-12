import { Link } from "react-router-dom";
export default function Nav(){
    return(
        <div className="flex h-[5vw] bg-gradient-to-t from-custom1 to-custom2 shadow-lg z-10">
            <div className="flex basis-1/4 text-red-900  justify-between items-center font-lobster-two italic text-5xl ml-5">
                <Link className=" cursor-pointer [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]" to="/">NutriVista</Link>
            </div>

            <div className="flex justify-center items-end pb-2 font-lato text-[1.2vw] font-semibold">About Us</div>
            
        </div>
    )
}