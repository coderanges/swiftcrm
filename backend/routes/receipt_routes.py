from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from ..database.models import db, Receipt, Invoice

receipt_bp = Blueprint('receipts', __name__)

# Web routes (Jinja2 templates)
@receipt_bp.route('/receipts')
@login_required
def receipts():
    user_receipts = Receipt.query.filter_by(user_id=current_user.id).all()
    return render_template('receipts.html', receipts=user_receipts)

@receipt_bp.route('/receipts/add', methods=['GET', 'POST'])
@login_required
def add_receipt():
    # Get all invoices for the current user for dropdown selection
    invoices = Invoice.query.filter_by(user_id=current_user.id, status='Unpaid').all()
    
    if request.method == 'POST':
        amount = request.form.get('amount')
        payment_method = request.form.get('payment_method')
        notes = request.form.get('notes')
        invoice_id = request.form.get('invoice_id')
        
        if not amount:
            flash('Amount is required!', 'danger')
            return redirect(url_for('receipts.add_receipt'))
        
        if not payment_method:
            flash('Payment method is required!', 'danger')
            return redirect(url_for('receipts.add_receipt'))
        
        if not invoice_id:
            flash('Invoice is required!', 'danger')
            return redirect(url_for('receipts.add_receipt'))
            
        # Validate that invoice belongs to user
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first()
        if not invoice:
            flash('Invalid invoice!', 'danger')
            return redirect(url_for('receipts.add_receipt'))
            
        new_receipt = Receipt(
            amount=float(amount),
            payment_method=payment_method,
            notes=notes,
            user_id=current_user.id,
            invoice_id=invoice_id
        )
        
        # Update invoice status based on payment amount
        total_paid = sum(r.amount for r in invoice.receipts) + float(amount)
        if total_paid >= invoice.amount:
            invoice.status = 'Paid'
        elif total_paid > 0:
            invoice.status = 'Partial'
        
        db.session.add(new_receipt)
        db.session.commit()
        
        flash('Receipt added successfully!', 'success')
        return redirect(url_for('receipts.receipts'))
        
    return render_template('add_receipt.html', invoices=invoices)

@receipt_bp.route('/receipts/<int:receipt_id>')
@login_required
def view_receipt(receipt_id):
    receipt = Receipt.query.filter_by(id=receipt_id, user_id=current_user.id).first_or_404()
    return render_template('view_receipt.html', receipt=receipt)

@receipt_bp.route('/receipts/<int:receipt_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_receipt(receipt_id):
    receipt = Receipt.query.filter_by(id=receipt_id, user_id=current_user.id).first_or_404()
    invoices = Invoice.query.filter_by(user_id=current_user.id).all()
    
    if request.method == 'POST':
        old_amount = receipt.amount
        new_amount = float(request.form.get('amount'))
        receipt.amount = new_amount
        receipt.payment_method = request.form.get('payment_method')
        receipt.notes = request.form.get('notes')
        
        invoice_id = request.form.get('invoice_id')
        # Validate that invoice belongs to user
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first()
        if not invoice:
            flash('Invalid invoice!', 'danger')
            return redirect(url_for('receipts.edit_receipt', receipt_id=receipt.id))
            
        # If invoice changed, update status of old and new invoice
        old_invoice = Invoice.query.get(receipt.invoice_id)
        if old_invoice.id != int(invoice_id):
            # Update old invoice status
            old_invoice_total_paid = sum(r.amount for r in old_invoice.receipts if r.id != receipt.id)
            if old_invoice_total_paid >= old_invoice.amount:
                old_invoice.status = 'Paid'
            elif old_invoice_total_paid > 0:
                old_invoice.status = 'Partial'
            else:
                old_invoice.status = 'Unpaid'
            
            receipt.invoice_id = invoice_id
            
            # Update new invoice status
            new_invoice_total_paid = sum(r.amount for r in invoice.receipts) + new_amount
            if new_invoice_total_paid >= invoice.amount:
                invoice.status = 'Paid'
            elif new_invoice_total_paid > 0:
                invoice.status = 'Partial'
        else:
            # Just update the same invoice status based on the new amount
            total_paid = sum(r.amount for r in invoice.receipts if r.id != receipt.id) + new_amount
            if total_paid >= invoice.amount:
                invoice.status = 'Paid'
            elif total_paid > 0:
                invoice.status = 'Partial'
            else:
                invoice.status = 'Unpaid'
        
        db.session.commit()
        
        flash('Receipt updated successfully!', 'success')
        return redirect(url_for('receipts.view_receipt', receipt_id=receipt.id))
        
    return render_template('edit_receipt.html', receipt=receipt, invoices=invoices)

@receipt_bp.route('/receipts/<int:receipt_id>/delete', methods=['POST'])
@login_required
def delete_receipt(receipt_id):
    receipt = Receipt.query.filter_by(id=receipt_id, user_id=current_user.id).first_or_404()
    invoice = Invoice.query.get(receipt.invoice_id)
    
    db.session.delete(receipt)
    
    # Update invoice status
    total_paid = sum(r.amount for r in invoice.receipts if r.id != receipt_id)
    if total_paid >= invoice.amount:
        invoice.status = 'Paid'
    elif total_paid > 0:
        invoice.status = 'Partial'
    else:
        invoice.status = 'Unpaid'
    
    db.session.commit()
    
    flash('Receipt deleted successfully!', 'success')
    return redirect(url_for('receipts.receipts'))

# API routes (for React frontend)
@receipt_bp.route('/api/receipts', methods=['GET'])
@login_required
def api_get_receipts():
    receipts = Receipt.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        'receipts': [
            {
                'id': receipt.id,
                'receipt_number': receipt.receipt_number,
                'amount': receipt.amount,
                'payment_method': receipt.payment_method,
                'notes': receipt.notes,
                'created_at': receipt.created_at.isoformat(),
                'invoice': {
                    'id': receipt.invoice.id,
                    'invoice_number': receipt.invoice.invoice_number
                }
            } for receipt in receipts
        ]
    }), 200

@receipt_bp.route('/api/receipts', methods=['POST'])
@login_required
def api_create_receipt():
    data = request.get_json()
    
    if not data or not data.get('amount') or not data.get('payment_method') or not data.get('invoice_id'):
        return jsonify({'error': 'Amount, payment method, and invoice_id are required'}), 400
        
    # Validate that invoice belongs to user
    invoice = Invoice.query.filter_by(id=data['invoice_id'], user_id=current_user.id).first()
    if not invoice:
        return jsonify({'error': 'Invalid invoice'}), 400
    
    new_receipt = Receipt(
        amount=float(data['amount']),
        payment_method=data['payment_method'],
        notes=data.get('notes'),
        user_id=current_user.id,
        invoice_id=data['invoice_id']
    )
    
    # Update invoice status based on payment amount
    total_paid = sum(r.amount for r in invoice.receipts) + float(data['amount'])
    if total_paid >= invoice.amount:
        invoice.status = 'Paid'
    elif total_paid > 0:
        invoice.status = 'Partial'
    
    db.session.add(new_receipt)
    db.session.commit()
    
    return jsonify({
        'message': 'Receipt created successfully',
        'receipt': {
            'id': new_receipt.id,
            'receipt_number': new_receipt.receipt_number,
            'amount': new_receipt.amount,
            'payment_method': new_receipt.payment_method,
            'notes': new_receipt.notes,
            'created_at': new_receipt.created_at.isoformat(),
            'invoice': {
                'id': invoice.id,
                'invoice_number': invoice.invoice_number
            }
        }
    }), 201

@receipt_bp.route('/api/receipts/<int:receipt_id>', methods=['GET'])
@login_required
def api_get_receipt(receipt_id):
    receipt = Receipt.query.filter_by(id=receipt_id, user_id=current_user.id).first_or_404()
    
    return jsonify({
        'receipt': {
            'id': receipt.id,
            'receipt_number': receipt.receipt_number,
            'amount': receipt.amount,
            'payment_method': receipt.payment_method,
            'notes': receipt.notes,
            'created_at': receipt.created_at.isoformat(),
            'invoice': {
                'id': receipt.invoice.id,
                'invoice_number': receipt.invoice.invoice_number
            }
        }
    }), 200

@receipt_bp.route('/api/receipts/<int:receipt_id>', methods=['PUT'])
@login_required
def api_update_receipt(receipt_id):
    receipt = Receipt.query.filter_by(id=receipt_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    old_amount = receipt.amount
    if 'amount' in data:
        receipt.amount = float(data['amount'])
    if 'payment_method' in data:
        receipt.payment_method = data['payment_method']
    if 'notes' in data:
        receipt.notes = data['notes']
    
    if 'invoice_id' in data and data['invoice_id'] != receipt.invoice_id:
        # Validate that new invoice belongs to user
        new_invoice = Invoice.query.filter_by(id=data['invoice_id'], user_id=current_user.id).first()
        if not new_invoice:
            return jsonify({'error': 'Invalid invoice'}), 400
        
        # Update old invoice status
        old_invoice = Invoice.query.get(receipt.invoice_id)
        old_invoice_total_paid = sum(r.amount for r in old_invoice.receipts if r.id != receipt.id)
        if old_invoice_total_paid >= old_invoice.amount:
            old_invoice.status = 'Paid'
        elif old_invoice_total_paid > 0:
            old_invoice.status = 'Partial'
        else:
            old_invoice.status = 'Unpaid'
        
        receipt.invoice_id = data['invoice_id']
        
        # Update new invoice status
        new_invoice_total_paid = sum(r.amount for r in new_invoice.receipts) + ('amount' in data and float(data['amount']) or old_amount)
        if new_invoice_total_paid >= new_invoice.amount:
            new_invoice.status = 'Paid'
        elif new_invoice_total_paid > 0:
            new_invoice.status = 'Partial'
    else:
        # Just update the same invoice status based on the new amount
        invoice = Invoice.query.get(receipt.invoice_id)
        total_paid = sum(r.amount for r in invoice.receipts if r.id != receipt.id) + receipt.amount
        if total_paid >= invoice.amount:
            invoice.status = 'Paid'
        elif total_paid > 0:
            invoice.status = 'Partial'
        else:
            invoice.status = 'Unpaid'
    
    db.session.commit()
    
    # Refresh to get updated data
    receipt = Receipt.query.get(receipt_id)
    
    return jsonify({
        'message': 'Receipt updated successfully',
        'receipt': {
            'id': receipt.id,
            'receipt_number': receipt.receipt_number,
            'amount': receipt.amount,
            'payment_method': receipt.payment_method,
            'notes': receipt.notes,
            'created_at': receipt.created_at.isoformat(),
            'invoice': {
                'id': receipt.invoice.id,
                'invoice_number': receipt.invoice.invoice_number
            }
        }
    }), 200

@receipt_bp.route('/api/receipts/<int:receipt_id>', methods=['DELETE'])
@login_required
def api_delete_receipt(receipt_id):
    receipt = Receipt.query.filter_by(id=receipt_id, user_id=current_user.id).first_or_404()
    invoice = Invoice.query.get(receipt.invoice_id)
    
    db.session.delete(receipt)
    
    # Update invoice status
    total_paid = sum(r.amount for r in invoice.receipts if r.id != receipt_id)
    if total_paid >= invoice.amount:
        invoice.status = 'Paid'
    elif total_paid > 0:
        invoice.status = 'Partial'
    else:
        invoice.status = 'Unpaid'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Receipt deleted successfully'
    }), 200
