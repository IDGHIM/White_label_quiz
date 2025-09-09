cat > run_security_tests.sh << 'EOF'
#!/bin/bash

echo "🛡️ Lancement des tests de sécurité..."

# Vérifier si l'environnement virtuel existe
if [ ! -d "security-env" ]; then
    echo "📦 Création de l'environnement virtuel..."
    python3 -m venv security-env
    
    # Vérifier si la création a réussi
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de la création de l'environnement virtuel"
        echo "Essayez avec 'python' au lieu de 'python3'"
        python -m venv security-env
        if [ $? -ne 0 ]; then
            echo "❌ Impossible de créer l'environnement virtuel"
            exit 1
        fi
    fi
    
    source security-env/bin/activate
    echo "⬇️ Installation des dépendances..."
    pip install requests urllib3
    echo "✅ Environnement créé et configuré"
else
    echo "🔧 Activation de l'environnement virtuel..."
    source security-env/bin/activate
fi

# Vérifier si le fichier Python existe
if [ ! -f "quiz_security_tester.py" ]; then
    echo "❌ Fichier 'quiz_security_tester.py' introuvable"
    echo "Assurez-vous que le script Python est dans le même dossier"
    exit 1
fi

echo "🚀 Lancement des tests de sécurité..."
python quiz_security_tester.py

echo "📊 Tests terminés. Vérifiez le rapport généré."
echo "ℹ️ Pour désactiver l'environnement : deactivate"
EOF