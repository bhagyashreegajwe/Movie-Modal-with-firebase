let cl = console.log;

const showModal = document.getElementById('showModal');
const backDrop = document.getElementById('backDrop');
const movieModal = document.getElementById('movieModal');
const movieContainer = document.getElementById('movieContainer');
const loader = document.getElementById('loader');
const closeModalbtns = [...document.querySelectorAll('.closeModal')];
const movieForm = document.getElementById('movieForm');
const titleControl = document.getElementById('title');
const imgUrlControl = document.getElementById('imgUrl');
const overviewControl = document.getElementById('overview');
const ratingControl = document.getElementById('rating');
const submitBtn = document.getElementById('submitBtn');
const updateBtn = document.getElementById('updateBtn');

const baseUrl = `https://fetch-movie-c7cec-default-rtdb.asia-southeast1.firebasedatabase.app`;
const moviesUrl = `${baseUrl}/movies.json`

const makeApiCall = (apiUrl, methodName, msgBody = null) => {
    loader.classList.remove('d-none');

    if(msgBody){
        msgBody = JSON.stringify(msgBody)
    }

    return fetch(apiUrl, {
        method : methodName,
        body : msgBody,
        headers: {
            "Content-Type" : "application/json",
        }
    }).then((res)=>{
        return res.json()
    })
}

const objToArr = (obj) => {
    let movieArr = [];
    for (const key in obj) {
        movieArr.push({...obj[key], id:key})
    }

    return movieArr
}

const snackBarMsg = (msg, iconName, time) => {
    Swal.fire({
        title: msg,
        icon: iconName,
        timer: time
    })
}


makeApiCall(moviesUrl, "GET", null)
.then((data)=>{
    let movieArr = objToArr(data)
    templating(movieArr.reverse())
    loader.classList.add('d-none');
}).catch((err)=>{
    cl(err)
})


const templating = (arr) => {
    movieContainer.innerHTML = arr.map((obj) => {
        return `
        <div class="col-md-4" id=${obj.id}>
            <div class="card mb-4 border-radius-10 border-none">
                <figure class="movieCard mb-0 border-radius-10">
                    <img 
                        src="${obj.imgUrl}"
                        alt="${obj.title}"
                        title="${obj.title}"
                    >
                    <figcaption>
                        <div class="ratingsection border-bottom border-none">
                            <div class="row">
                                <div class="col-sm-10">
                                    <h3>${obj.title}</h3>
                                </div>
                                <div class="col-sm-2">
                                    <span class='rating'>${obj.rating}</span>
                                </div>
                            </div>
                        </div>
                        <div class="overviewSection border-bottom border-none">
                            <h3>${obj.title}</h3>
                            <em>Overview</em>
                            <p>
                                ${obj.overview}
                            </p>
                            <div class="float-right edit-section">
                                <button class="btn btn-outline-info" onclick='onEdit(this)'>Edit</button>
                                <button class="btn btn-outline-danger" onclick='onDelete(this)'>Delete</button>
                            </div>
                        </div>
                    </figcaption>
                </figure>
            </div>
        </div>
        `
    }).join('')
}

const createMovieCard = (obj) => {
    let card = document.createElement('div');
    card.className = 'col-md-4';
    card.id = obj.id;
    card.innerHTML = `
    <div class="card mb-4 border-radius-10 border-none">
        <figure class="movieCard mb-0 border-radius-10">
            <img 
                src="${obj.imgUrl}"
                alt="${obj.title}"
                title="${obj.title}"
            >
            <figcaption>
                <div class="ratingsection border-bottom border-none">
                    <div class="row">
                        <div class="col-sm-10">
                            <h3>${obj.title}</h3>
                        </div>
                        <div class="col-sm-2">
                            <span class='rating'>${obj.rating}</span>
                        </div>
                    </div>
                </div>
                <div class="overviewSection border-bottom border-none">
                    <h3>${obj.title}</h3>
                    <em>Overview</em>
                    <p>
                        ${obj.overview}
                    </p>
                    <div class="float-right edit-section">
                        <button class="btn btn-outline-info" onclick='onEdit(this)'>Edit</button>
                        <button class="btn btn-outline-danger" onclick='onDelete(this)'>Delete</button>
                    </div>
                </div>
            </figcaption>
        </figure>
    </div>
    `
    movieContainer.prepend(card);
}


const onMovieAdd = (eve) => {
    eve.preventDefault();
    let movieObj = {
        title : titleControl.value,
        imgUrl : imgUrlControl.value,
        overview : overviewControl.value,
        rating : ratingControl.value,
    }
    
    makeApiCall(moviesUrl, "POST", movieObj)
    .then((res)=> {
        movieObj.id = res.name;
        createMovieCard(movieObj)
        snackBarMsg('Movie added successfully', 'success',1500)
        loader.classList.add('d-none');
        modalBackDropHide()
        cl(movieObj)
    }).catch((err)=>{
        cl(err)
    }).finally(()=>{
        movieForm.reset();
    })
}

const onEdit = (ele) => {
    const editId = ele.closest('.col-md-4').id;
    localStorage.setItem('editId', editId);
    let editUrl = `${baseUrl}/movies/${editId}.json`

    makeApiCall(editUrl, "GET")
    .then((res)=>{
        titleControl.value = res.title;
        imgUrlControl.value = res.imgUrl;
        overviewControl.value = res.overview;
        ratingControl.value = res.rating;
        modalBackDropShow();
        updateBtn.classList.remove('d-none');
        submitBtn.classList.add('d-none');
        loader.classList.add('d-none');
    }).catch((err)=>{
        cl(err)
    }).finally(()=>{
        loader.classList.add('d-none');
    })
}

const onMovieUpdate = () => {
    let updateId = localStorage.getItem('editId');
    let updateUrl = `${baseUrl}/movies/${updateId}.json`
    let updateObj = {
        title : titleControl.value,
        imgUrl : imgUrlControl.value,
        overview : overviewControl.value,
        rating : ratingControl.value,
    }

    makeApiCall(updateUrl, 'PATCH', updateObj)
    .then((res)=>{
        let card = document.getElementById(updateId);
        card.innerHTML = `
        <div class="card mb-4 border-radius-10 border-none">
            <figure class="movieCard mb-0 border-radius-10">
                <img 
                    src="${updateObj.imgUrl}"
                    alt="${updateObj.title}"
                    title="${updateObj.title}"
                >
                <figcaption>
                    <div class="ratingsection border-bottom border-none">
                        <div class="row">
                            <div class="col-sm-10">
                                <h3>${updateObj.title}</h3>
                            </div>
                            <div class="col-sm-2">
                                <span class='rating'>${updateObj.rating}</span>
                            </div>
                        </div>
                    </div>
                    <div class="overviewSection border-bottom border-none">
                        <h3>${updateObj.title}</h3>
                        <em>Overview</em>
                        <p>
                            ${updateObj.overview}
                        </p>
                        <div class="float-right edit-section">
                            <button class="btn btn-outline-info" onclick='onEdit(this)'>Edit</button>
                            <button class="btn btn-outline-danger" onclick='onDelete(this)'>Delete</button>
                        </div>
                    </div>
                </figcaption>
            </figure>
        </div>
        `
        modalBackDropHide();
        snackBarMsg('Updated movie information successfully', 'success', 1500);
        updateBtn.classList.add('d-none');
        submitBtn.classList.remove('d-none');
        loader.classList.add('d-none');
    }).catch((err)=>{
        cl(err);
        snackBarMsg('Something went wrong', 'error',1500)
    }).finally(()=>{
        movieForm.reset();
        loader.classList.add('d-none');
    })
}

const onDelete = (ele) => {
    Swal.fire({
        title: "Are you sure to delete it?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
            let deleteId = ele.closest('.col-md-4').id;
            let deleteUrl = `${baseUrl}/movies/${deleteId}.json`;
            loader.classList.remove('d-none');
            makeApiCall(deleteUrl, "DELETE", null)
            .then((res)=>{
                document.getElementById(deleteId).remove();
                snackBarMsg('Movie information deleted successfully', 'success', 1500);
                loader.classList.add('d-none');
            }).catch((err)=>{
                cl(err)
            })
        }
      });
}

const modalBackDropShow = () => {
    backDrop.classList.add('active');
    movieModal.classList.add('active');
}

const modalBackDropHide = () => {
    backDrop.classList.remove('active');
    movieModal.classList.remove('active');
    movieForm.reset();
    updateBtn.classList.add('d-none');
    submitBtn.classList.remove('d-none');
}

closeModalbtns.forEach((btn)=> {
    btn.addEventListener('click', modalBackDropHide)
})

showModal.addEventListener('click', modalBackDropShow)
movieForm.addEventListener('submit', onMovieAdd)
updateBtn.addEventListener('click', onMovieUpdate)