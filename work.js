import {Mouse} from './js/mouse.js';
import {Nav} from './js/nav.js';

const PROJ_TYPES = [
    {id: 0, string: "Software Engineer, Full Time"},
    {id: 1, string: "Software Engineering Internship"},
    {id: 2, string: "Research Assistant"},
    {id: 3, string: "Project @ Columbia Univeristy"},
    {id: 4, string: "Personal Project"},

];

const CARDS = [
    { 
        name: "Oracle, NetSuite", 
        description1: "NetSuite is a cloud business software suite for small to medium size companies with business solutions for ERP, CRM, PSA, etc.",
        description2: "At NetSuite, I am currently working for the ERP: Supply Chain Management, Allocation team, creating features and fixing bugs more specifically for the Supply Allocation engine. I have been working mostly with the backend, using Java and Oracle SQL, occasionally dabbling in JavaScript for specific bug fixes.", 
        note: "",
        year: 2021,
        dates: "Aug 2020 - Current",
        type: 0,
        img: ""
    },
    { 
        name: "Armaments Research Company", 
        description1: "Armaments Research Company is a company that creates data-focused arms accessories and software to ensure safety for security personnel.", 
        description2: "As a summer intern at ARC, I was tasked with creating a new company website. Starting with research into how companies and organizations in a similar space present themselves on the web, I designed the website with Adobe XD and developed it using the React framework. Some specific items I created for the website include an email form linked to the company mailbox, which increased customer email inquiries.",
        note:"*The current website of ARC may be different from the work I completed during the internship.",
        year: 2019,
        dates: "June 2019 – Aug 2019",
        type: 1,
        img: ""
    },
    { 
        name: "Creative Machines Lab", 
        description1: "At Columbia University’s Creative Machines Lab, I worked as a research assistant for a 3D food printer project. We were creating a new iteration of a 3D food printer, which prints food with the 3D printer and cooks it at the same time using laser heat technology.", 
        description2: "I worked on developing a GUI for the printer which removes the need for the previously MATLAB-coded configuration, and instead creates a toggle-able interface with a visual representation of the to-be-printed shape of the food object. This GUI was created using an open source software called FreeCAD written in C++, and was combined with 2 other open-source softwares to connect to the printer.",
        note: "",
        year: 2019,
        dates: "Sept 2019 – Jan 2020",
        type: 2,
        img: ""
    },
    { 
        name: "iBegoo", 
        description1: "At Columbia University’s CGUI Lab, I worked on a research project called iBegoo as a part of a course called Interactive Stories. This project aims to combine storytelling with Artificial Intelligence and Augmented Reality, by creating a AR avatar who can narrate a story and alter it depending on the user’s data and input.", 
        description2: "For this project, I worked in a team of four to create an internal web application tool, which allows the user to upload assets, create interactive storylines based on those assets, and export the storylines to C# code for further AR development in Unity. For this web application, I developed one of the main components, which was the interactive drag and drop dialogue tree builder that allows the user to create the narrative.",
        note: "",
        year: 2018,
        dates: "Sept 2018 – Jan 2019",
        type: 2,
        img: ""
    },
    { 
        name: "DivBot", 
        description1: "DivBot was a chatbot that won 2nd place at the DivHacks 2019 hackathon hosted at Columbia University. I worked in a team of three to create this chatbot. The theme for this hackathon was education, we decided to create a chatbot for users relatively new to computer science who want to learn more. Based on the user’s need, the chatbot would guide them to the appropriate online resource, or point them in the right direction if they are not sure where to start. We created the structure of the chatbot using Google Dialogflow and the front end website to host the chatbot using React.js.", 
        description2: "",
        note: "",
        year: 2019,
        dates: "Oct 2019",
        type: 3,
        img: ""
    },
    { 
        name: "Earbuzz", 
        description1: "Earbuzz was a project done for the Databases course I took at Columbia University. I tried to create a web application that was modeled after Spotify, using PostgreSQL, Google Cloud database, Python, and Spotify API.", 
        description2: "",
        note: "",
        year: 2019,
        dates: "October 2019 - December 2019",
        type: 3,
        img: ""
    },
    { 
        name: "Aokigahara", 
        description1: "Aokigahara was a personal game development project I worked on in a team of two. We used Unity to create a simple room-escape themed puzzle game where instead of the puzzles, the user would have to go through simple programming-related exercises that increase in difficulty as the player gets closer to the final escape.", 
        description2: "",
        note: "",
        year: 2018,
        dates: "June 2018 - Sept 2018",
        type: 4,
        img: ""
    },
    { 
        name: "Senior Thesis Visual Arts", 
        description1: "At Columbia University, I double-majored in Computer Science and Visual Arts. Senior year of the visual arts majors required there to be a senior thesis, and at the end of the year there would be an exhibit to show what was done throughout the year. However, due to the covid-19 situation, we were not able to show our work as was planned. Instead, we organized a thesis show online, by creating a website and a zoom opening. The website was to be hosted on a platform called Cargo, where each student would create a page that would serve as their section in the virtual show.", 
        description2: "As the only person with web development experience, I created the home page for this final thesis show which was designed to imitate a zoom meeting. The basic functionalities given in Cargo were not sufficient to create what we had envisioned, and therefore I added custom code in javascript, html, and css in order to create the final home page.",
        note: "Check out the website <a class=\"work-a\" href=\"https://columbiaseniorthesis.show/\" target=\"_blank\" rel=\"noopener noreferrer\">here</a>!",
        year: 2020,
        dates: "April 2020 - May 2020",
        type: 3,
        img: ""
    }
];


class Work {
    constructor() {
        this.html = '';

        CARDS.sort(function(a,b) {
            return a.type - b.type || b.year - a.year;
        })
        for (let i = 0; i < CARDS.length; i++) {
            this.html += '<div class="work-elem"><button class="work-main-head"><span class="hover-circle"></span><div class="work-name">'+
                CARDS[i].name+'</div><div class="work-title">'+PROJ_TYPES[CARDS[i].type].string+
                '</div></button><div class="work-main-sub"><div class="work-dates">'+
                CARDS[i].dates+'</div><div class="work-desc">'+CARDS[i].description1+
                '</div><div class="work-desc">'+CARDS[i].description2+'</div><div class="work-note">'+CARDS[i].note+'</div></div></div>';
        }

        document.getElementById('work-main').innerHTML = this.html;


        var coll = document.getElementsByClassName("work-main-head");
        var i;
        
        for (i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
            });
        }

        new Mouse();
        new Nav();
    }

    getProjectString(id) {
        return PROJ_TYPES[id].string;
    }

    onClick(){
        
    }

    resize() {
        
    }
}

window.onload = () => {
    new Work();
}