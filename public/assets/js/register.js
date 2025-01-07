function togglePasswordVisibility(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId); 
    const toggleImage = document.getElementById(toggleId); 
    const isPassword = passwordInput.type === 'password';  
    
    passwordInput.type = isPassword ? 'text' : 'password';

    toggleImage.src = isPassword ? '/../../assets/imgs/oeilBarrer.png' : '/../../assets/imgs/oeil.png';
}

document.getElementById('togglePassword').addEventListener('click', () => {
    togglePasswordVisibility('password', 'togglePassword');
});

document.getElementById('toggleConfirmPassword').addEventListener('click', () => {
    togglePasswordVisibility('confirmPassword', 'toggleConfirmPassword');
});
