(function() {
    // ---------- State ----------
    let semesters = {};
    let semesterOrder = [];
    let currentSemesterId = null;
    let idCounter = 0;
    let futureIdCounter = 0;
    let futureSemesters = [];
    let currentScale = '4.0';

    // ---------- Grade mappings for different scales -------
    const gradeMappings = {
        '4.0': {
            grades: [
                { label: 'A', value: 4.0 },
                { label: 'A-', value: 3.7 },
                { label: 'B+', value: 3.3 },
                { label: 'B', value: 3.0 },
                { label: 'B-', value: 2.7 },
                { label: 'C+', value: 2.3 },
                { label: 'C', value: 2.0 },
                { label: 'C-', value: 1.7 },
                { label: 'D', value: 1.0 },
                { label: 'F', value: 0.0 }
            ],
            maxGpa: 4.0,
            footer: 'A=4.0 · A-=3.7 · B+=3.3 · B=3.0 · B-=2.7 · C+=2.3 · C=2.0 · C-=1.7 · D=1.0 · F=0.0'
        },
        '5.0': {
            grades: [
                { label: 'A', value: 5.0 },
                { label: 'A-', value: 4.7 },
                { label: 'B+', value: 4.3 },
                { label: 'B', value: 4.0 },
                { label: 'B-', value: 3.7 },
                { label: 'C+', value: 3.3 },
                { label: 'C', value: 3.0 },
                { label: 'C-', value: 2.7 },
                { label: 'D', value: 2.0 },
                { label: 'F', value: 0.0 }
            ],
            maxGpa: 5.0,
            footer: 'A=5.0 · A-=4.7 · B+=4.3 · B=4.0 · B-=3.7 · C+=3.3 · C=3.0 · C-=2.7 · D=2.0 · F=0.0'
        },
        '10.0': {
            grades: [
                { label: 'A+', value: 10.0 },
                { label: 'A', value: 9.0 },
                { label: 'A-', value: 8.0 },
                { label: 'B+', value: 7.0 },
                { label: 'B', value: 6.0 },
                { label: 'B-', value: 5.0 },
                { label: 'C+', value: 4.0 },
                { label: 'C', value: 3.0 },
                { label: 'D', value: 2.0 },
                { label: 'F', value: 0.0 }
            ],
            maxGpa: 10.0,
            footer: 'A+=10 · A=9 · A-=8 · B+=7 · B=6 · B-=5 · C+=4 · C=3 · D=2 · F=0'
        },
        '100': {
            grades: [
                { label: 'A (90-100)', value: 90 },
                { label: 'A- (80-89)', value: 80 },
                { label: 'B+ (75-79)', value: 75 },
                { label: 'B (70-74)', value: 70 },
                { label: 'B- (65-69)', value: 65 },
                { label: 'C+ (60-64)', value: 60 },
                { label: 'C (55-59)', value: 55 },
                { label: 'C- (50-54)', value: 50 },
                { label: 'D (40-49)', value: 40 },
                { label: 'F (0-39)', value: 0 }
            ],
            maxGpa: 100,
            footer: 'A=90-100 · A-=80-89 · B+=75-79 · B=70-74 · B-=65-69 · C+=60-64 · C=55-59 · C-=50-54 · D=40-49 · F=0-39'
        }
    };

    // ---------- DOM refs ----------
    const semesterSelect = document.getElementById('semesterSelect');
    const addSemesterBtn = document.getElementById('addSemesterBtn');
    const renameSemesterBtn = document.getElementById('renameSemesterBtn');
    const deleteSemesterBtn = document.getElementById('deleteSemesterBtn');
    const semCountBadge = document.getElementById('semCountBadge');
    const semesterTitle = document.getElementById('semesterTitle');

    const subjectName = document.getElementById('subjectName');
    const subjectCredits = document.getElementById('subjectCredits');
    const subjectGrade = document.getElementById('subjectGrade');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const listContainer = document.getElementById('subjectListContainer');
    const semesterGpaSpan = document.getElementById('semesterGpa');
    const semesterCreditsSpan = document.getElementById('semesterCredits');
    const clearSemesterBtn = document.getElementById('clearSemesterBtn');
    const quickAddGpaBtn = document.getElementById('quickAddGpaBtn');

    const cgpaDisplay = document.getElementById('cgpaDisplay');
    const totalCreditsCgpa = document.getElementById('totalCreditsCgpa');
    const totalPointsCgpa = document.getElementById('totalPointsCgpa');
    const allSemestersSummary = document.getElementById('allSemestersSummary');
    const footerNote = document.getElementById('footerNote');

    const futureContainer = document.getElementById('futureSemestersContainer');
    const futureEmpty = document.getElementById('futureEmpty');
    const futureSemName = document.getElementById('futureSemName');
    const futureCredits = document.getElementById('futureCredits');
    const futureGpaSelect = document.getElementById('futureGpaSelect');
    const addFutureBtn = document.getElementById('addFutureBtn');
    const simulateBtn = document.getElementById('simulateBtn');
    const clearFutureBtn = document.getElementById('clearFutureBtn');
    const simulatedResult = document.getElementById('simulatedResult');

    const quickGpaModal = document.getElementById('quickGpaModal');
    const quickGpaInput = document.getElementById('quickGpaInput');
    const quickCreditsInput = document.getElementById('quickCreditsInput');
    const quickGpaCancel = document.getElementById('quickGpaCancel');
    const quickGpaConfirm = document.getElementById('quickGpaConfirm');

    const scaleRadios = document.querySelectorAll('input[name="scale"]');

    // ---------- Helpers ----------
    function round2(v) { return Math.round(v * 100) / 100; }

    function getScaleConfig() {
        return gradeMappings[currentScale] || gradeMappings['4.0'];
    }

    function calculateGPA(subjectsArray) {
        if (!subjectsArray || subjectsArray.length === 0) return { gpa: 0, totalCredits: 0, totalPoints: 0 };
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

    function getCurrentSemester() {
        if (!currentSemesterId || !semesters[currentSemesterId]) {
            if (semesterOrder.length === 0) {
                createNewSemester('Semester 1');
            }
            currentSemesterId = semesterOrder[0];
        }
        return semesters[currentSemesterId];
    }

    function createNewSemester(name) {
        const id = 'sem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        semesters[id] = { id, name, subjects: [] };
        semesterOrder.push(id);
        currentSemesterId = id;
        return id;
    }

    // Check if a semester was added via Quick Add
    function isQuickAddSemester(semester) {
        if (!semester || !semester.subjects || semester.subjects.length === 0) return false;
        // If there's exactly one subject and its name starts with "Semester GPA", it's a quick add
        return semester.subjects.length === 1 && semester.subjects[0].name && semester.subjects[0].name.startsWith('Semester GPA');
    }

    // ---------- Grade dropdown builder ----------
    function populateGradeDropdown(selectElement, scale) {
        const config = gradeMappings[scale];
        if (!config) return;
        selectElement.innerHTML = '';
        config.grades.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.value;
            opt.textContent = g.label + ' (' + g.value + ')';
            selectElement.appendChild(opt);
        });
    }

    function updateAllGradeDropdowns() {
        populateGradeDropdown(subjectGrade, currentScale);
        populateGradeDropdown(futureGpaSelect, currentScale);
        const config = getScaleConfig();
        footerNote.textContent = config.footer;
    }

    // ---------- Render functions ----------
    function renderSemesterSelector() {
        semesterSelect.innerHTML = '';
        semesterOrder.forEach(id => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = semesters[id].name;
            semesterSelect.appendChild(opt);
        });
        if (currentSemesterId && semesterOrder.includes(currentSemesterId)) {
            semesterSelect.value = currentSemesterId;
        } else if (semesterOrder.length > 0) {
            currentSemesterId = semesterOrder[0];
            semesterSelect.value = currentSemesterId;
        }
        semCountBadge.textContent = semesterOrder.length + ' semester' + (semesterOrder.length !== 1 ? 's' : '');
        updateSemesterTitle();
    }

    function updateSemesterTitle() {
        const sem = getCurrentSemester();
        if (sem) {
            semesterTitle.textContent = sem.name;
        }
    }

    function renderSubjects() {
        const sem = getCurrentSemester();
        if (!sem || sem.subjects.length === 0) {
            listContainer.innerHTML = `<div class="empty-message">No subjects in this semester.</div>`;
        } else {
            let html = '';
            for (let s of sem.subjects) {
                const displayGrade = s.gradePoint;
                // Check if this is a quick-add entry (starts with "Semester GPA")
                const isQuickAdd = s.name && s.name.startsWith('Semester GPA');
                const displayName = isQuickAdd ? `📊 ${s.name}: ${s.gradePoint.toFixed(2)}` : escapeHtml(s.name);
                const extraClass = isQuickAdd ? ' quick-add-item' : '';
                
                html += `
                    <div class="subject-item${extraClass}" data-id="${s.id}">
                        <div class="info">
                            <strong>${displayName}</strong>
                            <span class="badge">${s.credits} cr</span>
                            ${!isQuickAdd ? `<span class="badge">${displayGrade.toFixed(1)}</span>` : ''}
                        </div>
                        <span class="del" data-id="${s.id}">×</span>
                    </div>
                `;
            }
            listContainer.innerHTML = html;
            listContainer.querySelectorAll('.del').forEach(el => {
                el.addEventListener('click', function(e) {
                    const id = parseInt(this.dataset.id);
                    const sem = getCurrentSemester();
                    sem.subjects = sem.subjects.filter(s => s.id !== id);
                    renderSubjects();
                    updateStatsAndCGPA();
                });
            });
        }
        updateStatsAndCGPA();
    }

    function updateStatsAndCGPA() {
        const sem = getCurrentSemester();
        if (sem) {
            const data = calculateGPA(sem.subjects);
            semesterGpaSpan.textContent = data.gpa.toFixed(2);
            semesterCreditsSpan.textContent = data.totalCredits.toFixed(1);
        } else {
            semesterGpaSpan.textContent = '0.00';
            semesterCreditsSpan.textContent = '0';
        }

        let allSubjects = [];
        semesterOrder.forEach(id => {
            if (semesters[id]) {
                allSubjects = allSubjects.concat(semesters[id].subjects);
            }
        });
        const cgpaData = calculateGPA(allSubjects);
        cgpaDisplay.textContent = cgpaData.gpa.toFixed(2);
        totalCreditsCgpa.textContent = cgpaData.totalCredits.toFixed(1);
        totalPointsCgpa.textContent = cgpaData.totalPoints.toFixed(1);

        renderSemesterSummary();
        simulatedResult.textContent = '--';
    }

    function renderSemesterSummary() {
        if (semesterOrder.length === 0) {
            allSemestersSummary.innerHTML = `<div class="empty-message" style="font-size:0.8rem;">Add semesters to see summary</div>`;
            return;
        }
        let html = '';
        semesterOrder.forEach(id => {
            const sem = semesters[id];
            if (!sem) return;
            const data = calculateGPA(sem.subjects);
            const isQuickAdd = isQuickAddSemester(sem);
            const typeLabel = isQuickAdd ? ' (QA)' : '';
            const subjectDisplay = isQuickAdd ? '—' : sem.subjects.length;
            
            html += `
                <div class="sem-summary">
                    <span><span class="label">${escapeHtml(sem.name)}${typeLabel}</span></span>
                    <span><span class="label">GPA:</span> <span class="val">${data.gpa.toFixed(2)}</span></span>
                    <span><span class="label">Credits:</span> <span class="val">${data.totalCredits.toFixed(1)}</span></span>
                    <span><span class="label">Subjects:</span> <span class="val">${subjectDisplay}</span></span>
                </div>
            `;
        });
        allSemestersSummary.innerHTML = html;
    }

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
                        <span class="del" data-fid="${f.id}" style="cursor:pointer; margin-left:4px;">×</span>
                    </div>
                `;
            }
            futureContainer.innerHTML = html;
            futureContainer.querySelectorAll('.del').forEach(el => {
                el.addEventListener('click', function(e) {
                    const fid = parseInt(this.dataset.fid);
                    futureSemesters = futureSemesters.filter(f => f.id !== fid);
                    renderFuture();
                    simulatedResult.textContent = '--';
                });
            });
        }
    }

    // ---------- Scale change handler ----------
    function handleScaleChange() {
        const selected = document.querySelector('input[name="scale"]:checked');
        if (selected) {
            const newScale = selected.value;
            if (newScale !== currentScale) {
                currentScale = newScale;
                updateAllGradeDropdowns();
                // Convert existing grades to new scale (find closest match)
                convertAllGrades();
                renderSubjects();
                updateStatsAndCGPA();
                renderFuture();
            }
        }
    }

    function convertAllGrades() {
        const config = getScaleConfig();
        semesterOrder.forEach(id => {
            const sem = semesters[id];
            if (sem) {
                sem.subjects.forEach(subject => {
                    let closest = config.grades[0];
                    let minDiff = Infinity;
                    config.grades.forEach(g => {
                        const diff = Math.abs(g.value - subject.gradePoint);
                        if (diff < minDiff) {
                            minDiff = diff;
                            closest = g;
                        }
                    });
                    subject.gradePoint = closest.value;
                });
            }
        });
    }

    // ---------- Actions ----------
    function addSubject() {
        const sem = getCurrentSemester();
        if (!sem) return;
        
        // If this is a quick-add semester, warn user
        if (isQuickAddSemester(sem)) {
            if (!confirm('This semester was added via Quick Add. Adding individual subjects will replace the quick add entry. Continue?')) {
                return;
            }
            sem.subjects = [];
        }
        
        const name = subjectName.value.trim() || 'Untitled';
        const credits = parseFloat(subjectCredits.value);
        if (isNaN(credits) || credits <= 0) {
            alert('Please enter a valid number of credits.');
            return;
        }
        const gradePoint = parseFloat(subjectGrade.value);
        if (isNaN(gradePoint)) return;
        sem.subjects.push({
            id: idCounter++,
            name: name,
            credits: credits,
            gradePoint: gradePoint
        });
        renderSubjects();
        subjectName.value = '';
        subjectCredits.value = '3';
        subjectName.focus();
    }

    function addSemester() {
        const name = prompt('Enter semester name:', 'Semester ' + (semesterOrder.length + 1));
        if (name && name.trim()) {
            createNewSemester(name.trim());
            renderSemesterSelector();
            renderSubjects();
            updateStatsAndCGPA();
        }
    }

    function renameSemester() {
        const sem = getCurrentSemester();
        if (!sem) return;
        const newName = prompt('Rename semester:', sem.name);
        if (newName && newName.trim()) {
            sem.name = newName.trim();
            renderSemesterSelector();
            updateSemesterTitle();
            renderSemesterSummary();
        }
    }

    function deleteSemester() {
        if (semesterOrder.length <= 1) {
            alert('Cannot delete the last semester. Add a new one first.');
            return;
        }
        const sem = getCurrentSemester();
        if (!sem) return;
        if (confirm(`Delete semester "${sem.name}" and all its subjects?`)) {
            const index = semesterOrder.indexOf(currentSemesterId);
            semesterOrder = semesterOrder.filter(id => id !== currentSemesterId);
            delete semesters[currentSemesterId];
            currentSemesterId = semesterOrder[Math.min(index, semesterOrder.length - 1)];
            renderSemesterSelector();
            renderSubjects();
            updateStatsAndCGPA();
        }
    }

    function clearSemester() {
        const sem = getCurrentSemester();
        if (!sem) return;
        if (sem.subjects.length === 0) return;
        if (confirm('Clear all subjects from this semester?')) {
            sem.subjects = [];
            renderSubjects();
            updateStatsAndCGPA();
        }
    }

    function quickAddGpa() {
        const config = getScaleConfig();
        const sem = getCurrentSemester();
        
        // If semester has subjects, warn about replacement
        if (sem && sem.subjects.length > 0) {
            if (!confirm('This semester already has subjects. Quick Add will replace them. Continue?')) {
                return;
            }
        }
        
        quickGpaModal.style.display = 'flex';
        quickGpaInput.value = '';
        quickCreditsInput.value = '';
        quickGpaInput.placeholder = 'e.g. ' + (config.maxGpa / 2).toFixed(1);
        quickGpaInput.focus();
    }

    function confirmQuickAddGpa() {
        const config = getScaleConfig();
        const gpa = parseFloat(quickGpaInput.value);
        const credits = parseFloat(quickCreditsInput.value);
        if (isNaN(gpa) || gpa < 0 || gpa > config.maxGpa) {
            alert('Please enter a valid GPA between 0 and ' + config.maxGpa);
            return;
        }
        if (isNaN(credits) || credits <= 0) {
            alert('Please enter valid total credits');
            return;
        }
        const sem = getCurrentSemester();
        if (!sem) return;
        
        // Clear existing subjects
        sem.subjects = [];
        
        // Add a single subject that represents the entire semester
        sem.subjects.push({
            id: idCounter++,
            name: 'Semester GPA (Quick Add)',
            credits: credits,
            gradePoint: gpa
        });
        renderSubjects();
        updateStatsAndCGPA();
        quickGpaModal.style.display = 'none';
    }

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
        simulatedResult.textContent = '--';
        futureSemName.value = 'Future Sem';
        futureCredits.value = '15';
    }

    function simulateCGPA() {
        let allSubjects = [];
        semesterOrder.forEach(id => {
            if (semesters[id]) {
                allSubjects = allSubjects.concat(semesters[id].subjects);
            }
        });
        const current = calculateGPA(allSubjects);
        let totalCredits = current.totalCredits;
        let totalPoints = current.totalPoints;

        for (let f of futureSemesters) {
            const cred = parseFloat(f.credits) || 0;
            const gpa = parseFloat(f.gpa) || 0;
            totalCredits += cred;
            totalPoints += cred * gpa;
        }

        if (totalCredits === 0) {
            simulatedResult.textContent = 'No data to simulate';
            return;
        }
        const finalGpa = totalPoints / totalCredits;
        simulatedResult.textContent = 'Target CGPA: ' + round2(finalGpa).toFixed(2) + ' (with futures)';
    }

    function clearFuture() {
        futureSemesters = [];
        renderFuture();
        simulatedResult.textContent = '--';
    }

    // ---------- Event binding ----------
    // Semester selector change
    semesterSelect.addEventListener('change', function() {
        currentSemesterId = this.value;
        renderSubjects();
        updateStatsAndCGPA();
        updateSemesterTitle();
    });

    // Scale radio buttons
    scaleRadios.forEach(radio => {
        radio.addEventListener('change', handleScaleChange);
    });

    // Semester actions
    addSemesterBtn.addEventListener('click', addSemester);
    renameSemesterBtn.addEventListener('click', renameSemester);
    deleteSemesterBtn.addEventListener('click', deleteSemester);

    // Subject actions
    addSubjectBtn.addEventListener('click', addSubject);
    subjectName.addEventListener('keydown', (e) => { if (e.key === 'Enter') addSubject(); });
    subjectCredits.addEventListener('keydown', (e) => { if (e.key === 'Enter') addSubject(); });
    subjectGrade.addEventListener('keydown', (e) => { if (e.key === 'Enter') addSubject(); });

    clearSemesterBtn.addEventListener('click', clearSemester);
    quickAddGpaBtn.addEventListener('click', quickAddGpa);

    // Quick GPA modal
    quickGpaCancel.addEventListener('click', () => { quickGpaModal.style.display = 'none'; });
    quickGpaConfirm.addEventListener('click', confirmQuickAddGpa);
    quickGpaModal.addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
    });
    quickGpaInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmQuickAddGpa(); });
    quickCreditsInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmQuickAddGpa(); });

    // Future actions
    addFutureBtn.addEventListener('click', addFuture);
    futureSemName.addEventListener('keydown', (e) => { if (e.key === 'Enter') addFuture(); });
    futureCredits.addEventListener('keydown', (e) => { if (e.key === 'Enter') addFuture(); });
    futureGpaSelect.addEventListener('keydown', (e) => { if (e.key === 'Enter') addFuture(); });

    simulateBtn.addEventListener('click', simulateCGPA);
    clearFutureBtn.addEventListener('click', clearFuture);

    // ---------- Initialization ----------
    currentScale = '4.0';
    document.querySelector('input[name="scale"][value="4.0"]').checked = true;
    updateAllGradeDropdowns();

    // Initial demo data with sample semesters
    const sem1 = createNewSemester('Semester 1');
    semesters[sem1].subjects = [
        { id: idCounter++, name: 'Mathematics', credits: 3, gradePoint: 3.7 },
        { id: idCounter++, name: 'Physics', credits: 4, gradePoint: 3.0 },
        { id: idCounter++, name: 'Chemistry', credits: 3, gradePoint: 3.3 }
    ];

    const sem2 = createNewSemester('Semester 2');
    semesters[sem2].subjects = [
        { id: idCounter++, name: 'Biology', credits: 3, gradePoint: 3.0 },
        { id: idCounter++, name: 'Computer Science', credits: 4, gradePoint: 3.7 }
    ];

    futureSemesters = [
        { id: futureIdCounter++, name: 'Sem 5', credits: 16, gpa: 3.5 },
        { id: futureIdCounter++, name: 'Sem 6', credits: 15, gpa: 3.7 }
    ];

    renderSemesterSelector();
    renderSubjects();
    renderFuture();
    updateStatsAndCGPA();
})();
