'use strict'

console.log("partials working")

if(document.querySelectorAll(".flip-card").length > 0){

    document.querySelectorAll(".movie-watchlist").forEach( watchlistAnchor =>{

        let movieId = watchlistAnchor.dataset.movieid
        const currentPath = window.location.pathname;
        watchlistAnchor.href = currentPath + "/" + movieId
        console.log(watchlistAnchor.href)
    })
}



// document.querySelectorAll(".flip-card-back").forEach(cardNode => {

//     cardNode.addEventListener("click", (e)=>{
//         let closestButton = e.target.closest(".movie-add-watchlist")
//         console.log(closestButton)
//         let movieId = closestButton.dataset.movieId
//         const currentPath = window.location.pathname;
//         console.log(movieId)
        
//     })
// })
