import React, {useState, useEffect} from "react";
import {useForm} from "react-hook-form";
import Geocode from "react-geocode";
import "../../css/item-view.css";
import "../../css/header-and-body.css"
import {Link} from "react-router-dom";
import ItemViewMap from "../Map/ItemViewMap"
import Cookies from "js-cookie";
import {useHistory} from "react-router-dom";
import jwt_decode from "jwt-decode";

function ItemViewContent(id) {
    const history = useHistory();

    let itemLinkToPay = "/pay/item/" + id.value;

    const [itemId, setItemID] = useState(id.value);
    const [item, setItem] = useState([]);
    const [owner, setOwner] = useState([]);
    const [userEmail, setEmail] = useState([]);
    let [estimatedPrice, setEstimatedPrice] = useState(0);

    useEffect(() => {
        fetchItemDetails(itemId);
        fetchUserEmail();
    }, []);

    const fetchUserEmail = () => {
        if (Cookies.get("Authorization") !== undefined) {
            const token = Cookies.get("Authorization");
            const decodedToken = jwt_decode(token);
            console.log(decodedToken);
            setEmail(decodedToken.sub);
        }
    }


    const fetchItemDetails = async (itemId) => {
        const response = await fetch(`http://localhost:8080/api/items/${itemId}`,
            {
                method: 'GET',
                credentials: 'include',

            });
        const item = await response.json();
        setOwner(item.owner);
        setItem(item);
        console.log(owner);
    }
    function handleClick() {

        if (Cookies.get("Authorization") === undefined) {
            console.log("DOTARLO")
            history.push("/item/view/${itemId}");
        }else {
            history.push(itemLinkToPay)
        }

    }


    // google api key needed below
//    Geocode.setApiKey("");
//    Geocode.fromAddress(owner.address + ", " + owner.city).then(
//        response => {
//            const { lat, lng } = response.results[0].geometry.location;
//            console.log(lat, lng);
//            setLatitude(50.0484729);
//            setLongitude(19.9589230);
//        },
//        error => {
//            console.error(error);
//        }
//    );

    function authorizeListItemAccess(){
        let token = Cookies.get("Authorization");
        if(token !== undefined) {
            let tokenExpiration = jwt_decode(token).exp;
            let dateNow = new Date();
            if (tokenExpiration > dateNow.getTime() / 1000) {
                // history.push(itemLinkToPay);
                console.log("hello");
            }
        }
        else{
            lightUpLoginOptions();
        }
    }

    const {register, handleSubmit, errors} = useForm();

    const onSubmit =  async (data) => {
        const headers = new Headers();
        headers.append('Content-type', 'application/json');

        console.log(data);

        const options = {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        }

        const request = new Request('http://localhost:8080/api/reservations', options);
        const response = await fetch(request);
        const status = await response.status;
    }

    function lightUpLoginOptions(){
        document.getElementById("account-buttons").animate([
            {boxShadow: 'none'},
            {boxShadow: "0px 0px 20px 15px rgba(255,231,0, 1)"},
            {boxShadow: 'none'},
            {boxShadow: "0px 0px 20px 15px rgba(255,231,0, 1)"},
            {boxShadow: 'none'},
        ], {
            duration: 1600,
        })
    };

    function getDays() {
        let start = document.querySelector(".start-date").value.split('-');
        let end = document.querySelector(".end-date").value.split('-');

        let startDate = new Date(start[0], start[1] - 1, start[2]);
        let endDate = new Date(end[0], end[1] - 1, end[2]);

        let startDateMiilisec = startDate.getTime();
        let endDateMiilisec = endDate.getTime();

        const oneDayMilisec = 24 * 60 * 60 * 1000;

        let diffInDays = Math.abs((startDateMiilisec - endDateMiilisec) / oneDayMilisec) + 1;
        return diffInDays;
    }

    function calculatePrice() {
        let days = getDays();
        let price = item.price;
        let estimatedPrice = days * price;
        if (!isNaN(estimatedPrice)) {
            setEstimatedPrice(days * price);
        }
    }

    return (

        <div className="wrapper" >
            <form onChange={calculatePrice} onSubmit={handleSubmit(onSubmit)}>
            <div className="item-view-container">
                <div id="photos-name-price-container">
                    <div className="main-item-photo-area">
                        <div className="main-item-photo-container">
                            <div className="slideshow-container">
                                <div className="slides-container">
                                    <div className="mySlides1">
                                        <img alt="item-image" src={item.picUrl}/>
                                    </div>
                                </div>
                                <a className="prev" onClick="plusSlides(-1, 0)">&#10094;</a>
                                <a className="next" onClick="plusSlides(1, 0)">&#10095;</a>
                            </div>
                        </div>
                    </div>
                    <div id="item-name-price">
                        <p className="item-heading">{item.name}</p>
                        <p className="item-heading-2">Price: {item.price} pln/day</p>

                            <div className="calendar">
                                <p className="form-label">From:</p>
                                <input type="date" className="input-field start-date" name="reservationStartDate"
                                       ref={register()}/>
                                <p className="form-label">Until :</p>
                                <input type="date" className="input-field end-date" name="reservationEndDate"
                                       ref={register()}/>
                                <p className="price-estimation">Estimated price: {estimatedPrice} pln</p>
                                <input name="price" value={estimatedPrice} ref={register()} style={{display: "none"}}/>
                                <input name="itemId" value={item.id} ref={register()} style={{display: "none"}}/>
                                <input name="userEmail" value={userEmail} ref={register()} style={{display: "none"}}/>
                            </div>

                    </div>
                    <div className="description-renter-name">
                        <button className="see-renter" type="submit">{owner.firstName} {owner.lastName}</button>
                        <p className="item-heading-2 item-heading-description">Description</p>
                        <p className="item-normal-text">{item.description}</p>
                    </div>
                    <div>
                       <button className="button book-now" type="submit" onClick={onSubmit()} onClick={handleClick} onClick={authorizeListItemAccess}>Rent Me!</button>
                    </div>
                </div>
                    <p className="item-heading-2 item-location">Location</p>
                    <p>{owner.address}, {owner.postCode} {owner.city}</p>
                    <ItemViewMap lat={owner.lat} lng={owner.lng}/>
            </div>
            </form>
        </div>
    )
}

export default ItemViewContent;