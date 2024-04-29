import { useState } from "react";
import axios from "axios";
import Nav from "../Nav/Nav"
import SearchIcon from "./SearchIcon"
export default function Home(){
    const [searchInput, setSearchInput]=useState(null);
    const [searchResponse,setSearchResponse]=useState([]);

    const handleChange=async (e)=>{
        setSearchInput(e.target.value);

        e.preventDefault();
        const data={search:e.target.value}
           
        axios.post('http://localhost:8000/search', data)
        .then((response) => {               
            const json=response.data;
            if (response.status === 200) {
                // console.log(json.searchResults);
                setSearchResponse(json.searchResults);
                console.log(json)
            }
            else{
                // Handle errors here
                console.error('Request failed');
                // setError(response.data.error)
                
            }                
        })
        .catch((error) => {
            console.error(error.response.data.error);
           
            
        });
    }
    return(
        <div className="flex flex-col h-screen overflow-x-hidden">
            <div className="flex-none"><Nav /></div>
            <div className="flex-1 flex flex-col  text-white">
                <div className="flex flex-col justify-center items-center h-[28vw] bg-gradient-to-r from-red-900 via-red-800 to-red-600 ml-1 mr-1">
                    <div className="relative bottom-20 font-sacramento text-7xl">Search for a food category</div>
                    <div className="flex">
                        <input type="text" 
                        placeholder="Enter" 
                        className="outline-none rounded-l-3xl opacity-80 text-black pl-5 p-2 text-xl font-lato h-[3.5vw] w-[25vw] "
                        onChange={handleChange}>
                        </input>
                        
                        <div className="flex justify-center items-center outline-none h-[3.5vw] w-[5vw] bg-white bg-opacity-80 rounded-r-3xl">
                            <SearchIcon />
                        </div>
                    </div>
                    {/* <div className="h-[20vw] w-[50vw] bg-gradient-to-t from-[#eae9e9] to-custom2 rounded-lg shadow-lg">

                    </div> */}

                </div>

                <div className="flex flex-col mb-4 w-full">
                    
                    <div className="flex mt-3 ml-5 w-full ">
                        <img src="pic2.jpg" className=" h-[30vw] w-auto" alt="Nike"></img>
                        
                        
                        <div className="flex flex-col ml-2 mt-10 w-4/6">
                            <div className="text-black text-4xl font-bold font-ubuntu mt-5 mb-3 flex justify-center">
                                Unlock Your Favorite Foods' Nutritional Secrets
                            </div>
                            <div className="flex flex-col text-black ml-20">
                            Our platform offers comprehensive nutritional insights across diverse food categories, 
                            empowering users with the ability to delve deep into the nutritional profiles of their favorite foods. 
                            From staples like bread and peanut butter to an extensive selection of packaged goods, our database covers 
                            a wide range of products, ensuring there's something to suit every taste and dietary preference. 
                            With user-friendly search functionality, navigating through our comprehensive database is effortless, 
                            making it easy to find the nutritional information you need, whenever you need it. Whether you're tracking 
                            macros, managing dietary restrictions, or simply curious about the nutritional content of your favorite snacks,
                             our platform puts the power of knowledge at your fingertips, enabling you to make informed choices and fueling 
                             your journey toward healthier eating habits.
                            </div>
                            
                        </div>
                        
                    </div>
                    
                </div>  
            
            </div>
        </div>
    )
}