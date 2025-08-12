document.addEventListener('DOMContentLoaded', function() {
    const examForm = document.getElementById('exam-form');
    const showPlansBtn = document.getElementById('show-plans');
    const plansHistory = document.getElementById('plans-history');
    const savedPlans = document.getElementById('saved-plans');
    const flowchart = document.getElementById('flowchart');
    const countdown = document.getElementById('countdown');

    loadPlans();

    examForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const examName = document.getElementById('exam-name').value;
        const examDate = document.getElementById('exam-date').value;
        const topics = document.getElementById('topics').value.split(',').map(topic => topic.trim());
        const subtopics = document.getElementById('subtopics').value.split(',').map(subtopic => subtopic.trim());
        const topicTime = document.getElementById('topic-time').value;
        const subtopicTime = document.getElementById('subtopic-time').value;
        
        const studyPlan = {
            examName,
            examDate,
            topics: topics.filter(topic => topic !== ''),
            subtopics: subtopics.filter(subtopic => subtopic !== ''),
            topicTime,
            subtopicTime,
            createdAt: new Date().toISOString()
        };
        
        savePlan(studyPlan);
        
        generateFlowchart(studyPlan);
        
        updateCountdown(examDate);
        
        examForm.reset();
    });
    
    showPlansBtn.addEventListener('click', function() {
        plansHistory.classList.toggle('hidden');
        if (!plansHistory.classList.contains('hidden')) {
            loadPlans();
        }
    });
    
    function savePlan(plan) {
        let plans = JSON.parse(localStorage.getItem('studyPlans')) || [];
        plans.push(plan);
        localStorage.setItem('studyPlans', JSON.stringify(plans));
    }
    
    function loadPlans() {
        const plans = JSON.parse(localStorage.getItem('studyPlans')) || [];
        savedPlans.innerHTML = '';
        
        if (plans.length === 0) {
            savedPlans.innerHTML = '<p>No previous study plans found.</p>';
            return;
        }
        
        plans.forEach((plan, index) => {
            const planCard = document.createElement('div');
            planCard.className = 'plan-card';
            
            const daysLeft = Math.floor((new Date(plan.examDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            planCard.innerHTML = `
                <h4>${plan.examName}</h4>
                <p><strong>Exam Date:</strong> ${formatDate(plan.examDate)}</p>
                <p><strong>Days Left:</strong> ${daysLeft > 0 ? daysLeft : 'Exam passed'}</p>
                <p><strong>Topics:</strong> ${plan.topics.join(', ')}</p>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            
            savedPlans.appendChild(planCard);
        });
        
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                deletePlan(index);
            });
        });
    }
    
    function deletePlan(index) {
        let plans = JSON.parse(localStorage.getItem('studyPlans')) || [];
        plans.splice(index, 1);
        localStorage.setItem('studyPlans', JSON.stringify(plans));
        loadPlans();
    }
    
    function generateFlowchart(plan) {
        flowchart.innerHTML = '';
        
        const examTitle = document.createElement('div');
        examTitle.className = 'flowchart-node';
        const daysLeft = Math.floor((new Date(plan.examDate) - new Date()) / (1000 * 60 * 60 * 24));
        examTitle.innerHTML = `<strong>${plan.examName}</strong> (${formatDate(plan.examDate)}, ${daysLeft} days left)`;
        flowchart.appendChild(examTitle);
        
        plan.topics.forEach(topic => {
            const topicNode = document.createElement('div');
            topicNode.className = 'flowchart-node';
            topicNode.innerHTML = `${topic} (${plan.topicTime} hours)`;
            flowchart.appendChild(topicNode);
            
            if (plan.subtopics && plan.subtopics.length > 0) {
                plan.subtopics.forEach(subtopic => {
                    const subtopicNode = document.createElement('div');
                    subtopicNode.className = 'flowchart-subnode';
                    subtopicNode.innerHTML = `${subtopic} (${plan.subtopicTime} hours)`;
                    flowchart.appendChild(subtopicNode);
                });
            }
        });
    }
    
    function updateCountdown(examDate) {
        const today = new Date();
        const examDay = new Date(examDate);
        const diffTime = examDay - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
            countdown.textContent = `${diffDays} days until your exam!`;
        } else if (diffDays === 0) {
            countdown.textContent = 'Your exam is today!';
        } else {
            countdown.textContent = 'Your exam date has passed.';
        }
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});