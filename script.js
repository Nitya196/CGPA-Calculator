// script.js
(function () {
    // ---------- state ----------
    let subjects = [];            // { id, name, credits, gradePoint }
    let futureSemesters = [];     // { id, name, credits, gpa }
    let idCounter = 0;
    let futureIdCounter = 0;

    // ---------- DOM refs ----------
    const subjectName = document.getElementById('subjectName');
    const subjectCredits = document.getElementById('subjectCredits');
    const subjectGrade = document.getElementById('subjectGrade');
    const addBtn = document.getElementById('addSubjectBtn');
    const listContainer = document.getElementById('subjectListContainer');
    const semesterGpaSpan = document.getElementById('semesterGpa');
    const semesterCreditsSpan = document.getElementById('semesterCredits');
    const clearSemesterBtn = document.getElementById('clearSemesterBtn');

    const cgpaDisplay = document.getElementById('cgpaDisplay');
    const totalCreditsCgpa = document.getElementById('totalCreditsCgpa');
    const totalPointsCgpa = document.getElementById('totalPointsCgpa');

    const futureContainer = document.getElementById('futureSemestersContainer');
    const futureEmpty = document.getElementById('futureEmpty');
    const futureSemName = document.getElementById('futureSemName');
    const futureCredits = document.getElementById('futureCredits');
    const futureGpaSelect = document.getElementById('futureGpaSelect');
    const addFutureBtn = document.getElementById('addFutureBtn');
    const simulateBtn = document.getElementById('simulateBtn');
    const clearFutureBtn = document.getElementById('clearFutureBtn');
    const simulatedResult = document.getElementById('simulatedResult');

    // ---------- helpers ----------
    function round2(v) { return Math.round(v * 100) / 100; }

    function calculateGPA(subjectsArray) {
        if (!subjectsArray.length) return { gpa: 0, totalCredits: 0, totalPoints: 0 };
        let totalCredits = 0, totalPoints = 0;
        for (let s of subjectsArray) {
            const cred = parseFloat(s.credits) || 0;
            const pt = parseFloat(s.gradePoint) || 0;
            totalCredits += cred;
            totalPoints += cred * pt;
        }
        const gpa = totalCredits === 0 ? 0 : totalPoints / totalCredits;
        return { gpa: round2(gpa), totalCredits: round2(totalCredits), totalPoints: round2(totalPoints) };
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ---------- render subjects (current semester) ----------
    function renderSubjects() {
        if (subjects.length === 0) {
            listContainer.innerHTML = `<div class="empty-message">No subjects added yet.</div>`;
        } else {
            let html = '';
            for (let s of subjects) {
                html += `
                                                                                                                                                                                                                                                                                                                                                        <div class="subject-item" data-id="${s.id}">
                                                                                                                                                                                                                                                                                                                                                                                <div class="info">
                                                                                                                                                                                                                                                                                                                                                                                                            <strong>${escapeHtml(s.name)}</strong>
                                                                                                                                                                                                                                                                                                                                                                                                                                        <span class="badge">${s.credits} cr</span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <span class="badge">${s.gradePoint.toFixed(1)}</span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <span class="del" data-id="${s.id}">✕</span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        `;
            }
            listContainer.innerHTML = html;

            // delete event
            listContainer.querySelectorAll('.del').forEach(el => {
                el.addEventListener('click', function (e) {
                    const id = parseInt(this.dataset.id);
                    subjects = subjects.filter(s => s.id !== id);
                    renderSubjects();
                    updateStatsAndCGPA();
                });
            });
        }
        updateStatsAndCGPA();
    }

    // ---------- update semester stats + CGPA ----------
    function updateStatsAndCGPA() {
        const semData = calculateGPA(subjects);
        semesterGpaSpan.textContent = semData.gpa.toFixed(2);
        semesterCreditsSpan.textContent = semData.totalCredits.toFixed(1);

        // CGPA from all subjects (current semester)
        const cgpaData = calculateGPA(subjects);
        cgpaDisplay.textContent = cgpaData.gpa.toFixed(2);
        totalCreditsCgpa.textContent = cgpaData.totalCredits.toFixed(1);
        totalPointsCgpa.textContent = cgpaData.totalPoints.toFixed(1);

        // also clear simulation result when subjects change
        simulatedResult.textContent = '—';
    }

    // ---------- render future semesters ----------
    function renderFuture() {
        if (futureSemesters.length === 0) {
            futureContainer.innerHTML = `<div class="empty-message" id="futureEmpty">No future semesters. Add one below.</div>`;
        } else {
            let html = '';
            for (let f of futureSemesters) {
                html += `
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <div class="future-item" data-fid="${f.id}">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <span>${escapeHtml(f.name)}</span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <span style="opacity:0.7;">${f.credits} cr</span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <span style="font-weight:500;">${f.gpa.toFixed(2)}</span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <span class="del" data-fid="${f.id}" style="cursor:pointer; margin-left:4px;">✕</span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        `;
            }
            futureContainer.innerHTML = html;
            futureContainer.querySelectorAll('.del').forEach(el => {
                el.addEventListener('click', function (e) {
                    const fid = parseInt(this.dataset.fid);
                    futureSemesters = futureSemesters.filter(f => f.id !== fid);
                    renderFuture();
                    // clear simulation result
                    simulatedResult.textContent = '—';
                });
            });
        }
    }

    // ---------- add subject ----------
    function addSubject() {
        const name = subjectName.value.trim() || 'Untitled';
        const credits = parseFloat(subjectCredits.value);
        if (isNaN(credits) || credits <= 0) {
            alert('Please enter a valid number of credits.');
            return;
        }
        const gradePoint = parseFloat(subjectGrade.value);
        if (isNaN(gradePoint)) return;
        subjects.push({
            id: idCounter++,
            name: name,
            credits: credits,
            gradePoint: gradePoint
        });
        renderSubjects();
        // reset simulation result
        simulatedResult.textContent = '—';
        // clear inputs but keep useful
        subjectName.value = '';
        subjectCredits.value = '3';
        subjectGrade.value = '3.0';
        subjectName.focus();
    }

    // ---------- add future semester ----------
    function addFuture() {
        const name = futureSemName.value.trim() || 'Future';
        const credits = parseFloat(futureCredits.value);
        if (isNaN(credits) || credits <= 0) {
            alert('Enter valid credits.');
            return;
        }
        const gpa = parseFloat(futureGpaSelect.value);
        if (isNaN(gpa)) return;
        futureSemesters.push({
            id: futureIdCounter++,
            name: name,
            credits: credits,
            gpa: gpa
        });
        renderFuture();
        simulatedResult.textContent = '—';
        futureSemName.value = 'Future Sem';
        futureCredits.value = '15';
        futureGpaSelect.value = '3.0';
    }

    // ---------- simulate CGPA ----------
    function simulateCGPA() {
        if (subjects.length === 0 && futureSemesters.length === 0) {
            simulatedResult.textContent = '⚠️ Add subjects or futures';
            return;
        }
        // current CGPA from subjects
        const current = calculateGPA(subjects);
        let totalCredits = current.totalCredits;
        let totalPoints = current.totalPoints;

        // add future semesters
        for (let f of futureSemesters) {
            const cred = parseFloat(f.credits) || 0;
            const gpa = parseFloat(f.gpa) || 0;
            totalCredits += cred;
            totalPoints += cred * gpa;
        }

        const finalGpa = totalCredits === 0 ? 0 : totalPoints / totalCredits;
        simulatedResult.textContent = `🎯 ${round2(finalGpa).toFixed(2)} CGPA (with futures)`;
    }

    // ---------- clear semester ----------
    function clearSemester() {
        subjects = [];
        renderSubjects();
        simulatedResult.textContent = '—';
    }

    function clearFuture() {
        futureSemesters = [];
        renderFuture();
        simulatedResult.textContent = '—';
    }

    // ---------- event binding ----------
    addBtn.addEventListener('click', addSubject);
    subjectName.addEventListener('keydown', (e) => { if (e.key === 'Enter') addSubject(); });
    subjectCredits.addEventListener('keydown', (e) => { if (e.key === 'Enter') addSubject(); });
    subjectGrade.addEventListener('keydown', (e) => { if (e.key === 'Enter') addSubject(); });

    clearSemesterBtn.addEventListener('click', clearSemester);

    addFutureBtn.addEventListener('click', addFuture);
    futureSemName.addEventListener('keydown', (e) => { if (e.key === 'Enter') addFuture(); });
    futureCredits.addEventListener('keydown', (e) => { if (e.key === 'Enter') addFuture(); });
    futureGpaSelect.addEventListener('keydown', (e) => { if (e.key === 'Enter') addFuture(); });

    simulateBtn.addEventListener('click', simulateCGPA);
    clearFutureBtn.addEventListener('click', clearFuture);

    // ---------- initial demo data ----------
    subjects = [
        { id: idCounter++, name: 'Mathematics', credits: 3, gradePoint: 3.7 },
        { id: idCounter++, name: 'Physics', credits: 4, gradePoint: 3.0 },
        { id: idCounter++, name: 'Chemistry', credits: 3, gradePoint: 3.3 }
    ];
    futureSemesters = [
        { id: futureIdCounter++, name: 'Sem 5', credits: 16, gpa: 3.5 },
        { id: futureIdCounter++, name: 'Sem 6', credits: 15, gpa: 3.7 }
    ];
    renderSubjects();
    renderFuture();
    updateStatsAndCGPA();
})();