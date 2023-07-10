import React, { useState } from "react"
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./ShowDetailsPopup.css"

function ShowDetailsPopup(props) {

    const StarRating = ({ rating }) => {
        const stars = [];
        const fullStars = Math.floor(rating); // Number of full stars
        const hasHalfStar = rating % 1 !== 0; // Check if there's a half star

        // Generate full star icons
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FontAwesomeIcon icon={faStar} className="star" key={i} />);
        }

        // Generate half star icon if applicable
        if (hasHalfStar) {
            stars.push(<FontAwesomeIcon icon={faStarHalfAlt} className="star" key={fullStars} />);
        }
        return (
            <div className="star-rating">
                <div className="stars">{stars}&ensp;{rating}/10</div>
            </div>
        );
    };

    function insidePopup() {
        return (
            <div className="popup">
                <div className="popup-inner">
                    <br></br>
                    <center>
                        <h5 style={{ display: "inline" }}>Movie Genre: </h5><p style={{ display: "inline" }}>{props.genre}</p><br></br>
                        <h5 style={{ display: "inline" }}>Price: </h5><p style={{ display: "inline" }}>${props.price}</p>
                        {props.description === "" ? <div><h5 style={{ display: "inline" }}>Description:</h5> <p style={{ display: "inline" }}>Not Available!</p></div> : <div><h5>Description:</h5><p>{props.description}</p></div>}
                        <h5 style={{ display: "inline" }}>Language: </h5><p style={{ display: "inline" }}>{props.language}</p><br></br>
                        <h5 style={{ display: "inline" }}>Subtitle: </h5><p style={{ display: "inline" }}>{props.language}</p><br></br>
                        {props.rating === 0 ? <div><h5 style={{ display: "inline" }}>Rating:</h5> <p style={{ display: "inline" }}>Not Available!</p></div> : <div><h5 style={{ display: "inline" }}>Rating:</h5>&ensp;<StarRating rating={props.rating} /></div>}
                        <button type="button" onClick={() => { props.setTrigger(false) }} className="popup-close2" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    </center>
                </div>
            </div>
        );
    }

    return (
        <div>
            {props.trigger === true ? insidePopup() : null}
        </div>
    );
}

export default ShowDetailsPopup;