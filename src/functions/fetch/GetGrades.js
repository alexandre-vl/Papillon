// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
async function getGrades() {
    // as only pronote is supported for now, we can just return the pronote timetable
    
    // return pronote timetable
    return getPronoteGrades();
}

// pronote : get timetable
function getPronoteGrades() {
    // gather vars
    const API = app.config.globalProperties.$api;

    // get token
    const token = localStorage.getItem('token');

    // construct url (date is a TEST date)
    let URL = `${API}/grades?token=${token}`;

    // check if timetable is cached
    let gradeCache = localStorage.getItem('gradeCache');

    if(gradeCache != null) {
        // timetable is cached, check if it's up to date
        gradeCache = JSON.parse(gradeCache);

        let today = new Date();
        let cacheDate = new Date(gradeCache.date);

        if(today.toDateString() == cacheDate.toDateString()) {
            // timetable is up to date, return it
            return new Promise((resolve, reject) => {
                resolve(constructPronoteGrades(gradeCache.grades));
            });
        }
    }

    // send request
    return axios.get(URL)
        .then((response) => {
            if(response.data == 'expired') {
                // token expired, get new token
                GetToken();
            }

            // save timetable to localstorage cache with today's date
            let today = new Date();
            let gradeCache = {
                date: today,
                grades: response.data
            }

            localStorage.setItem('gradeCache', JSON.stringify(gradeCache));

            // construct timetable and return it as a promise
            return new Promise((resolve, reject) => {
                resolve(constructPronoteGrades(response.data));
            });
        })
        .catch((error) => {
            // error, return error
            return new Promise((resolve, reject) => {
                reject(error);
            });
        });
}

// pronote : construct timetable
function constructPronoteGrades(grades) {
    let averages = grades.averages;
    let marks = grades.grades;

    let markArray = [];

    // for each mark, add it to the corresponding subject in the array
    marks.forEach(mark => {
        // check if subject exists
        let subject = markArray.find(subject => subject.name == mark.subject);

        if(subject == undefined) {
            // subject doesn't exist, create it
            subject = {
                name: mark.subject,
                marks: []
            }

            markArray.push(subject);
        }

        // for each info in mark.grade, parse it to a float
        for(let info in mark.grade) {
            mark.grade[info] = parseFloat(mark.grade[info]);
        }

        // add mark to subject
        let newMark = {
            info: {
                subject: mark.subject,
                date: mark.date,
            },
            grade: mark.grade
        }

        if(isNaN(mark.grade.value)) {
            newMark.grade.value = -1;
            newMark.info.abs = true;
        }
        else {
            newMark.info.abs = false;
        }

        subject.marks.push(newMark);
    });
    
    // sort marks by date
    markArray.forEach(subject => {
        subject.marks.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
    });

    // add averages
    averages.forEach(average => {
        // check if subject exists
        let subject = markArray.find(subject => subject.name == average.subject);

        if(subject == undefined) {
            // subject doesn't exist, create it
            subject = {
                name: average.subject,
                marks: []
            }

            markArray.push(subject);
        }

        // add average to subject
        subject.average = parseFloat(average.average);

        subject.class = {};

        subject.class.average = parseFloat(average.class_average);
        subject.class.min = parseFloat(average.min);
        subject.class.max = parseFloat(average.max);
    });

    // calculate averages
    let studentAverage = parseFloat(grades.overall_average);
    
    let classAverage = 0;
    let classMin = 0;
    let classMax = 0;

    markArray.forEach(subject => {
        classAverage += parseFloat(subject.class.average);
        classMin += parseFloat(subject.class.min);
        classMax += parseFloat(subject.class.max);
    });

    classAverage /= averages.length;
    classMin /= averages.length;
    classMax /= averages.length;

    // add averages to array
    let avgs = {
        average: studentAverage,
        class: {
            average: classAverage,
            min: classMin,
            max: classMax
        }
    }

    let finalArray = {
        marks: markArray,
        averages: avgs
    }
    
    return finalArray;
}

// export
export default getPronoteGrades;