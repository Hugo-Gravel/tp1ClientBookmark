//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
var selectCat = null;
Init_UI();

function Init_UI() {
    renderBookmarks();
    renderCategory();
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });

}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de favorie</h2>
                <hr>
                <p>
                    Petite application de gestion des favorie à Title de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Hugo Gravel 
                    </p>
                    <p>
                    Inspiration: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderBookmarks() {
    showWaitingGif();
    $("#actionTitle").text("Liste des Favories");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await Bookmarks_API.Get();
    eraseContent();
    if (bookmarks !== null) {
        bookmarks.forEach(bookmarks => {
            $("#content").append(renderBookmark(bookmarks));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        $(".bookmarkRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
async function renderCategory() {
    $(".dropdown").remove();
    $("#header").append(` <div class="dropdown ms-auto">
    <div data-bs-toggle="dropdown" aria-expanded="false">
        <i class="cmdIcon fa fa-ellipsis-vertical"></i>
    </div>
    <div class="dropdown-menu noselect">
        <div class="dropdown-menu noselect show" id="DDMenu">
        <div class="dropdown-item menuItemLayout all" id="allCatCmd ">   
            <i class="menuIcon fa fa-fw mx-2"></i> Toutes les catégories
        </div>
        <div class="dropdown-divider"></div>
        
      
        </div>
        </div>`);
    let bookmarks = await Bookmarks_API.Get();
    let catArray = [];
    for (bookmark of bookmarks) {
        if (!catArray.includes(bookmark.Category)) {
            catArray.push(bookmark.Category);
        }
    }
    catArray.sort();

    for (cat of catArray) {
        if (cat == selectCat) {
            $("#DDMenu").append(`<div class="dropdown-item menuItemLayout category" id="allCatCmd">
            <i class="menuIcon fa fa-check mx-2"></i> ${cat}
        </div>`);
        }
        else {
            $("#DDMenu").append(`<div class="dropdown-item menuItemLayout category" id="allCatCmd">
            <i class="menuIcon fa fa-fw mx-2"></i> ${cat}   
        </div>`);
        }
    }
    $("#DDMenu").append(` <div class="dropdown-divider"></div>
     <div class="dropdown-item menuItemLayout pro" id="aboutCmd">
         <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
     </div>`);



    $(".category").on("click", function () {
        selectCat = $(this).text().trim();
        renderCategory();
        renderBookmarks();


    });

    $(".all").on("click", function () {
        selectCat = null;
        renderCategory();
        renderBookmarks();


    });

    $(".pro").on("click", function () {
        selectCat = null;
        renderCategory();
        renderAbout();


    });


}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let bookmark = await Bookmarks_API.Get(id);
    if (bookmark !== null)
        renderBookmarkForm(bookmark);
    else
        renderError("Favorie introuvable!");
}
async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await Bookmarks_API.Get(id);
    eraseContent();

 
    if (bookmark !== null) {
        $("#content").append(`
        <div class="bookmarkdeleteForm">
            <h4>Effacer le favorie suivant?</h4>
            <br>

            <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
                <div class="bookmarkContainer">
                <a href="${bookmark.Url}">
                    <div class="bookmarkLayout">
                    <div class="row">
                        <span class="big-favicon ,column" style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${bookmark.Url}');"> </span>    
                          <span class="bookmarkTitle , column">${bookmark.Title}   </span>
                          </div>   
                        <div class="bookmarkCategory">${bookmark.Category}</div>    
                    </div>
                    </a><
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await Bookmarks_API.Delete(bookmark.Id);
            if (result){
                selectCat = null;
                renderCategory();
                renderBookmarks();
                }
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("favorie introuvable!");
    }
}
function newBookmark() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Title = "";
    bookmark.Url = "";
    bookmark.Category = "";
    return bookmark;
}
function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    if (create) bookmark = newBookmark();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="bookmarkForm">
        <input type="hidden" name="Id" value="${bookmark.Id}"/>
        <div id="logocible">
        `+ (bookmark.Url ? `
     
        <div class="big-favicon ,column" style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${bookmark.Url}');"> </div>  
        `:
            `
        <div >
        <img src='Bookmark_logo.PNG' class="big-favicon2" alt="" title="Gestionnaire de Favories">
        </div>
        `
        ) + ` </div>



           

            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Title"
                required
                RequireMessage="Veuillez entrer un Title"
                InvalidMessage="Le Title comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control URL"
                name="Url"
                id="Url"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                required
                RequireMessage="Veuillez entrer un Url" 
                InvalidMessage="Veuillez entrer un Url valide"
                value="${bookmark.Url}" 
            />
            <label for="Category" class="form-label"> Categorie </label>
            <input 
                class="form-control Category"
                name="Category"
                id="Category"
                placeholder="Category"
                required
                RequireMessage="Veuillez entrer une Category" 
                InvalidMessage="Veuillez entrer une Category valide"
                value="${bookmark.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#Url').on("change", function () {
        $('#logocible').empty();
        if ($('#Url').val()) {
            $('#logocible').append(`<div class="big-favicon2" style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${$(this).val()}');"></div>`);
        } else {
            $('#logocible').append(` <img src='Bookmark_logo.PNG' class="appLogo" alt="" title="Gestionnaire de Favories"></img>`);
        }

    });
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await Bookmarks_API.Save(bookmark, create);
        if (result){
            selectCat = null;
                renderCategory();
                renderBookmarks();
        }
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}
//<img ></img>
function renderBookmark(bookmark) {
    if (bookmark.Category == selectCat || selectCat == null) {


        return $(`
    
     <div class="contactRow" contact_id=${bookmark.Id}">
     
        <div class="bookmarkContainer noselect">
        <a href="${bookmark.Url}"><div class="bookmarkLayout">
        <div class="row">
         <span class="big-favicon ,column" style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${bookmark.Url}');"> </span>    
                <span class="bookmarkTitle , column">${bookmark.Title}   </span>
        </div>    
                <div class="bookmarkCategory">${bookmark.Category}</div>
            </div></a>
            <div class="bookmarkCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}" Title="Modifier ${bookmark.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}" Title="Effacer ${bookmark.Title}"></span>
            </div>
        </div>
    </div>           
    `);
    }
}