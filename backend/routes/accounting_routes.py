from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from ..database.models import db, AccountingEntry, Invoice, Receipt
from datetime import datetime, timedelta
from sqlalchemy import func

accounting_bp = Blueprint('accounting', __name__)

# Web routes (Jinja2 templates)
@accounting_bp.route('/accounting')
@login_required
def accounting():
    # Get all accounting entries for the current user
    entries = AccountingEntry.query.filter_by(user_id=current_user.id).order_by(AccountingEntry.date.desc()).all()
    
    # Calculate total income and expenses
    total_income = db.session.query(func.sum(AccountingEntry.amount)).filter_by(
        user_id=current_user.id, entry_type='Income'
    ).scalar() or 0
    
    total_expenses = db.session.query(func.sum(AccountingEntry.amount)).filter_by(
        user_id=current_user.id, entry_type='Expense'
    ).scalar() or 0
    
    net_profit = total_income - total_expenses
    
    # Get recent invoices and receipts
    recent_invoices = Invoice.query.filter_by(user_id=current_user.id).order_by(Invoice.created_at.desc()).limit(5).all()
    recent_receipts = Receipt.query.filter_by(user_id=current_user.id).order_by(Receipt.created_at.desc()).limit(5).all()
    
    return render_template('accounting.html', 
                          entries=entries, 
                          total_income=total_income, 
                          total_expenses=total_expenses, 
                          net_profit=net_profit,
                          recent_invoices=recent_invoices,
                          recent_receipts=recent_receipts)

@accounting_bp.route('/accounting/add', methods=['GET', 'POST'])
@login_required
def add_entry():
    if request.method == 'POST':
        entry_type = request.form.get('entry_type')
        category = request.form.get('category')
        amount = request.form.get('amount')
        description = request.form.get('description')
        date = request.form.get('date')
        
        if not entry_type or entry_type not in ['Income', 'Expense']:
            flash('Valid entry type is required!', 'danger')
            return redirect(url_for('accounting.add_entry'))
        
        if not category:
            flash('Category is required!', 'danger')
            return redirect(url_for('accounting.add_entry'))
        
        if not amount:
            flash('Amount is required!', 'danger')
            return redirect(url_for('accounting.add_entry'))
            
        # Convert date string to datetime object
        if date:
            date_obj = datetime.strptime(date, '%Y-%m-%d')
        else:
            date_obj = datetime.utcnow()
            
        new_entry = AccountingEntry(
            entry_type=entry_type,
            category=category,
            amount=float(amount),
            description=description,
            date=date_obj,
            user_id=current_user.id
        )
        
        db.session.add(new_entry)
        db.session.commit()
        
        flash('Accounting entry added successfully!', 'success')
        return redirect(url_for('accounting.accounting'))
        
    return render_template('add_accounting_entry.html')

@accounting_bp.route('/accounting/<int:entry_id>')
@login_required
def view_entry(entry_id):
    entry = AccountingEntry.query.filter_by(id=entry_id, user_id=current_user.id).first_or_404()
    return render_template('view_accounting_entry.html', entry=entry)

@accounting_bp.route('/accounting/<int:entry_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_entry(entry_id):
    entry = AccountingEntry.query.filter_by(id=entry_id, user_id=current_user.id).first_or_404()
    
    if request.method == 'POST':
        entry.entry_type = request.form.get('entry_type')
        entry.category = request.form.get('category')
        entry.amount = float(request.form.get('amount'))
        entry.description = request.form.get('description')
        
        # Convert date string to datetime object
        date = request.form.get('date')
        if date:
            entry.date = datetime.strptime(date, '%Y-%m-%d')
        
        db.session.commit()
        
        flash('Accounting entry updated successfully!', 'success')
        return redirect(url_for('accounting.view_entry', entry_id=entry.id))
        
    return render_template('edit_accounting_entry.html', entry=entry)

@accounting_bp.route('/accounting/<int:entry_id>/delete', methods=['POST'])
@login_required
def delete_entry(entry_id):
    entry = AccountingEntry.query.filter_by(id=entry_id, user_id=current_user.id).first_or_404()
    
    db.session.delete(entry)
    db.session.commit()
    
    flash('Accounting entry deleted successfully!', 'success')
    return redirect(url_for('accounting.accounting'))

@accounting_bp.route('/accounting/reports')
@login_required
def reports():
    # Get the time period from request args
    period = request.args.get('period', 'month')
    
    # Calculate the date range based on the period
    end_date = datetime.utcnow()
    if period == 'week':
        start_date = end_date - timedelta(days=7)
    elif period == 'month':
        start_date = end_date - timedelta(days=30)
    elif period == 'quarter':
        start_date = end_date - timedelta(days=90)
    elif period == 'year':
        start_date = end_date - timedelta(days=365)
    else:  # Default to month
        start_date = end_date - timedelta(days=30)
    
    # Get income and expense entries within the date range
    income_entries = AccountingEntry.query.filter(
        AccountingEntry.user_id == current_user.id,
        AccountingEntry.entry_type == 'Income',
        AccountingEntry.date >= start_date,
        AccountingEntry.date <= end_date
    ).all()
    
    expense_entries = AccountingEntry.query.filter(
        AccountingEntry.user_id == current_user.id,
        AccountingEntry.entry_type == 'Expense',
        AccountingEntry.date >= start_date,
        AccountingEntry.date <= end_date
    ).all()
    
    # Calculate totals
    total_income = sum(entry.amount for entry in income_entries)
    total_expenses = sum(entry.amount for entry in expense_entries)
    net_profit = total_income - total_expenses
    
    # Aggregate data by category for charts
    income_by_category = {}
    for entry in income_entries:
        if entry.category in income_by_category:
            income_by_category[entry.category] += entry.amount
        else:
            income_by_category[entry.category] = entry.amount
    
    expense_by_category = {}
    for entry in expense_entries:
        if entry.category in expense_by_category:
            expense_by_category[entry.category] += entry.amount
        else:
            expense_by_category[entry.category] = entry.amount
    
    return render_template('accounting_reports.html',
                          period=period,
                          start_date=start_date,
                          end_date=end_date,
                          income_entries=income_entries,
                          expense_entries=expense_entries,
                          total_income=total_income,
                          total_expenses=total_expenses,
                          net_profit=net_profit,
                          income_by_category=income_by_category,
                          expense_by_category=expense_by_category)

# API routes (for React frontend)
@accounting_bp.route('/api/accounting/entries', methods=['GET'])
@login_required
def api_get_entries():
    entries = AccountingEntry.query.filter_by(user_id=current_user.id).order_by(AccountingEntry.date.desc()).all()
    return jsonify({
        'entries': [
            {
                'id': entry.id,
                'entry_type': entry.entry_type,
                'category': entry.category,
                'amount': entry.amount,
                'description': entry.description,
                'date': entry.date.isoformat(),
                'created_at': entry.created_at.isoformat()
            } for entry in entries
        ]
    }), 200

@accounting_bp.route('/api/accounting/entries', methods=['POST'])
@login_required
def api_create_entry():
    data = request.get_json()
    
    if not data or not data.get('entry_type') or not data.get('category') or not data.get('amount'):
        return jsonify({'error': 'Entry type, category, and amount are required'}), 400
    
    if data['entry_type'] not in ['Income', 'Expense']:
        return jsonify({'error': 'Entry type must be Income or Expense'}), 400
    
    # Parse date if provided
    date_obj = None
    if data.get('date'):
        try:
            date_obj = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use ISO format.'}), 400
    else:
        date_obj = datetime.utcnow()
    
    new_entry = AccountingEntry(
        entry_type=data['entry_type'],
        category=data['category'],
        amount=float(data['amount']),
        description=data.get('description'),
        date=date_obj,
        user_id=current_user.id
    )
    
    db.session.add(new_entry)
    db.session.commit()
    
    return jsonify({
        'message': 'Accounting entry created successfully',
        'entry': {
            'id': new_entry.id,
            'entry_type': new_entry.entry_type,
            'category': new_entry.category,
            'amount': new_entry.amount,
            'description': new_entry.description,
            'date': new_entry.date.isoformat(),
            'created_at': new_entry.created_at.isoformat()
        }
    }), 201

@accounting_bp.route('/api/accounting/entries/<int:entry_id>', methods=['GET'])
@login_required
def api_get_entry(entry_id):
    entry = AccountingEntry.query.filter_by(id=entry_id, user_id=current_user.id).first_or_404()
    
    return jsonify({
        'entry': {
            'id': entry.id,
            'entry_type': entry.entry_type,
            'category': entry.category,
            'amount': entry.amount,
            'description': entry.description,
            'date': entry.date.isoformat(),
            'created_at': entry.created_at.isoformat()
        }
    }), 200

@accounting_bp.route('/api/accounting/entries/<int:entry_id>', methods=['PUT'])
@login_required
def api_update_entry(entry_id):
    entry = AccountingEntry.query.filter_by(id=entry_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if 'entry_type' in data:
        if data['entry_type'] not in ['Income', 'Expense']:
            return jsonify({'error': 'Entry type must be Income or Expense'}), 400
        entry.entry_type = data['entry_type']
    
    if 'category' in data:
        entry.category = data['category']
    
    if 'amount' in data:
        entry.amount = float(data['amount'])
    
    if 'description' in data:
        entry.description = data['description']
    
    if 'date' in data:
        try:
            entry.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use ISO format.'}), 400
    
    db.session.commit()
    
    return jsonify({
        'message': 'Accounting entry updated successfully',
        'entry': {
            'id': entry.id,
            'entry_type': entry.entry_type,
            'category': entry.category,
            'amount': entry.amount,
            'description': entry.description,
            'date': entry.date.isoformat(),
            'created_at': entry.created_at.isoformat()
        }
    }), 200

@accounting_bp.route('/api/accounting/entries/<int:entry_id>', methods=['DELETE'])
@login_required
def api_delete_entry(entry_id):
    entry = AccountingEntry.query.filter_by(id=entry_id, user_id=current_user.id).first_or_404()
    
    db.session.delete(entry)
    db.session.commit()
    
    return jsonify({
        'message': 'Accounting entry deleted successfully'
    }), 200

@accounting_bp.route('/api/accounting/summary', methods=['GET'])
@login_required
def api_get_summary():
    # Get time period from query parameters
    period = request.args.get('period', 'month')
    
    # Calculate the date range based on the period
    end_date = datetime.utcnow()
    if period == 'week':
        start_date = end_date - timedelta(days=7)
    elif period == 'month':
        start_date = end_date - timedelta(days=30)
    elif period == 'quarter':
        start_date = end_date - timedelta(days=90)
    elif period == 'year':
        start_date = end_date - timedelta(days=365)
    else:  # Default to month
        start_date = end_date - timedelta(days=30)
    
    # Get total income and expenses
    total_income = db.session.query(func.sum(AccountingEntry.amount)).filter(
        AccountingEntry.user_id == current_user.id,
        AccountingEntry.entry_type == 'Income',
        AccountingEntry.date >= start_date,
        AccountingEntry.date <= end_date
    ).scalar() or 0
    
    total_expenses = db.session.query(func.sum(AccountingEntry.amount)).filter(
        AccountingEntry.user_id == current_user.id,
        AccountingEntry.entry_type == 'Expense',
        AccountingEntry.date >= start_date,
        AccountingEntry.date <= end_date
    ).scalar() or 0
    
    # Get income and expenses by category
    income_entries = AccountingEntry.query.filter(
        AccountingEntry.user_id == current_user.id,
        AccountingEntry.entry_type == 'Income',
        AccountingEntry.date >= start_date,
        AccountingEntry.date <= end_date
    ).all()
    
    expense_entries = AccountingEntry.query.filter(
        AccountingEntry.user_id == current_user.id,
        AccountingEntry.entry_type == 'Expense',
        AccountingEntry.date >= start_date,
        AccountingEntry.date <= end_date
    ).all()
    
    # Aggregate data by category
    income_by_category = {}
    for entry in income_entries:
        if entry.category in income_by_category:
            income_by_category[entry.category] += entry.amount
        else:
            income_by_category[entry.category] = entry.amount
    
    expense_by_category = {}
    for entry in expense_entries:
        if entry.category in expense_by_category:
            expense_by_category[entry.category] += entry.amount
        else:
            expense_by_category[entry.category] = entry.amount
    
    return jsonify({
        'summary': {
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net_profit': total_income - total_expenses,
            'income_by_category': [
                {'category': category, 'amount': amount}
                for category, amount in income_by_category.items()
            ],
            'expense_by_category': [
                {'category': category, 'amount': amount}
                for category, amount in expense_by_category.items()
            ]
        }
    }), 200
